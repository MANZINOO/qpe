const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Triggered ogni volta che viene creato un documento in
 * users/{userId}/notifications/{notifId}.
 * Legge il token FCM dell'utente destinatario e invia la push.
 */
// ── Blocklist moderazione ──────────────────────────────────────────────────
const BLOCKLIST = [
  // Italiano
  'cazzo','minchia','vaffanculo','fanculo','stronzo','stronza','coglione',
  'cogliona','puttana','troia','bastardo','bastarda','merda','culo','figa',
  'porco dio','porcodio','madonna','maledetto','idiota','ritardato','mongo',
  'negro','negra','frocio','froccia','ricchione','culattone','lesbica',
  'handicappato','down','autistico','ammazzati','muori','ucciditi','gay','diocane', 'dio cane',
  // Inglese
  'fuck','shit','bitch','asshole','nigger','nigga','faggot','cunt','whore',
  'slut','retard','kill yourself','kys','die','rape','nazi',
];

// Incrementa violations sull'utente; al 3° → modalità limitata
async function penalizeUser(authorId) {
  if (!authorId) return;
  const userRef = db.collection('users').doc(authorId);
  await userRef.update({ violations: FieldValue.increment(1) });
  const snap = await userRef.get();
  if ((snap.data()?.violations || 0) >= 3) {
    await userRef.update({ userMode: 'limited' });
    console.log(`[QPe Moderation] Utente ${authorId} messo in modalità limitata`);
  }
}

function containsBlocklisted(text) {
  if (!text) return false;
  const lower = text.toLowerCase().replace(/[^a-zàèéìíîòóùú0-9\s]/g, ' ');
  return BLOCKLIST.some(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(lower) || lower.includes(word);
  });
}

/**
 * Moderazione automatica: elimina i sondaggi con contenuto inappropriato.
 * Controlla titolo, opzioni e hashtag.
 */
exports.moderatePoll = onDocumentCreated(
  'polls/{pollId}',
  async (event) => {
    const poll = event.data?.data();
    if (!poll) return;

    const textsToCheck = [
      poll.title,
      poll.optionA?.text,
      poll.optionB?.text,
      ...(poll.hashtags || []),
    ];

    if (!textsToCheck.some(containsBlocklisted)) return;

    const pollId = event.params.pollId;
    // Elimina tutti i commenti e risposte prima di eliminare il poll
    const commentsSnap = await db.collection('polls').doc(pollId).collection('comments').get();
    for (const commentDoc of commentsSnap.docs) {
      const repliesSnap = await commentDoc.ref.collection('replies').get();
      await Promise.all(repliesSnap.docs.map(r => r.ref.delete()));
      await commentDoc.ref.delete();
    }
    await db.collection('polls').doc(pollId).delete();
    await penalizeUser(poll.authorId);

    console.log(`[QPe Moderation] Poll ${pollId} eliminato (contenuto inappropriato)`);
  }
);

/**
 * Moderazione automatica commenti: elimina se contiene contenuto inappropriato.
 */
exports.moderateComment = onDocumentCreated(
  'polls/{pollId}/comments/{commentId}',
  async (event) => {
    const comment = event.data?.data();
    if (!comment || !containsBlocklisted(comment.text)) return;

    const { pollId, commentId } = event.params;
    const commentRef = db.collection('polls').doc(pollId).collection('comments').doc(commentId);
    const repliesSnap = await commentRef.collection('replies').get();
    await Promise.all(repliesSnap.docs.map(r => r.ref.delete()));
    await commentRef.delete();
    await penalizeUser(comment.uid);

    console.log(`[QPe Moderation] Commento ${commentId} eliminato (contenuto inappropriato)`);
  }
);

/**
 * Moderazione automatica risposte: elimina se contiene contenuto inappropriato.
 */
exports.moderateReply = onDocumentCreated(
  'polls/{pollId}/comments/{commentId}/replies/{replyId}',
  async (event) => {
    const reply = event.data?.data();
    if (!reply || !containsBlocklisted(reply.text)) return;

    const { pollId, commentId, replyId } = event.params;
    await db.collection('polls').doc(pollId)
      .collection('comments').doc(commentId)
      .collection('replies').doc(replyId).delete();
    await penalizeUser(reply.uid);

    console.log(`[QPe Moderation] Risposta ${replyId} eliminata (contenuto inappropriato)`);
  }
);

// ── QPé Plus / Stripe ─────────────────────────────────────────────────────

// Inizializzazione lazy: la chiave è disponibile solo a runtime sul cloud
function getStripe() {
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

exports.createCheckoutSession = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new Error('Non autenticato');

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    metadata: { uid },
    success_url: 'https://qpe-app.web.app/plus/success',
    cancel_url: 'https://qpe-app.web.app/plus',
  });

  return { url: session.url };
});

exports.stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[QPe Stripe] Webhook signature error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    if (uid) {
      await db.collection('users').doc(uid).update({
        plus: true,
        plusSince: FieldValue.serverTimestamp(),
        stripeCustomerId: session.customer,
      });
      console.log(`[QPe Stripe] Plus attivato per ${uid}`);
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    const snap = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
    if (!snap.empty) {
      await snap.docs[0].ref.update({ plus: false });
      console.log(`[QPe Stripe] Plus disattivato per customer ${customerId}`);
    }
  }

  res.json({ received: true });
});

exports.sendPushOnNotification = onDocumentCreated(
  'users/{userId}/notifications/{notifId}',
  async (event) => {
    const notif = event.data?.data();
    if (!notif) return;

    const userId = event.params.userId;

    try {
      const userSnap = await db.collection('users').doc(userId).get();
      const fcmToken = userSnap.data()?.fcmToken;
      if (!fcmToken) return; // utente non ha attivato le notifiche push

      let title = 'QPé';
      let body = '';
      let url = '/notifications';

      switch (notif.type) {
        case 'vote':
          title = 'Nuovo voto!';
          body = `${notif.fromUsername} ha votato il tuo sondaggio`;
          if (notif.pollId) url = `/poll/${notif.pollId}`;
          break;
        case 'follow':
          title = 'Nuovo follower!';
          body = `${notif.fromUsername} ha iniziato a seguirti`;
          break;
        case 'followRequest':
          title = 'Richiesta di follow';
          body = `${notif.fromUsername} vuole seguirti`;
          break;
        case 'like':
          title = 'Mi piace!';
          body = `${notif.fromUsername} ha messo like al tuo sondaggio`;
          if (notif.pollId) url = `/poll/${notif.pollId}`;
          break;
        case 'comment':
          title = 'Nuovo commento!';
          body = `${notif.fromUsername} ha commentato il tuo sondaggio`;
          if (notif.pollId) url = `/poll/${notif.pollId}`;
          break;
        default:
          body = 'Hai una nuova notifica';
      }

      await messaging.send({
        token: fcmToken,
        notification: { title, body },
        webpush: {
          fcmOptions: { link: url },
          notification: {
            icon: 'https://qpe.web.app/qpe_logo.svg',
            badge: 'https://qpe.web.app/favicon.svg',
          },
        },
      });
    } catch (err) {
      // Token non valido o scaduto: rimuovilo per non sprecare chiamate future
      if (err.code === 'messaging/registration-token-not-registered') {
        await db.collection('users').doc(userId).update({ fcmToken: null });
      } else {
        console.error('[QPe] Errore invio push:', err.message);
      }
    }
  }
);
