const { onDocumentCreated } = require('firebase-functions/v2/firestore');
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
  'handicappato','down','autistico','ammazzati','muori','ucciditi',
  // Inglese
  'fuck','shit','bitch','asshole','nigger','nigga','faggot','cunt','whore',
  'slut','retard','kill yourself','kys','die','rape','nazi',
];

function containsBlocklisted(text) {
  if (!text) return false;
  const lower = text.toLowerCase().replace(/[^a-zàèéìíîòóùú0-9\s]/g, ' ');
  return BLOCKLIST.some(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(lower) || lower.includes(word);
  });
}

/**
 * Moderazione automatica: nasconde i sondaggi con contenuto inappropriato.
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

    const flagged = textsToCheck.some(containsBlocklisted);
    if (!flagged) return;

    const pollId = event.params.pollId;
    await db.collection('polls').doc(pollId).update({
      hidden: true,
      flagged: true,
      flaggedAt: FieldValue.serverTimestamp(),
      flagReason: 'blocklist',
    });

    console.log(`[QPe Moderation] Poll ${pollId} nascosto (contenuto inappropriato)`);
  }
);

/**
 * Moderazione automatica commenti.
 * Imposta hidden:true sul commento se contiene contenuto inappropriato.
 */
exports.moderateComment = onDocumentCreated(
  'polls/{pollId}/comments/{commentId}',
  async (event) => {
    const comment = event.data?.data();
    if (!comment || !containsBlocklisted(comment.text)) return;

    const { pollId, commentId } = event.params;
    await db.collection('polls').doc(pollId)
      .collection('comments').doc(commentId).update({
        hidden: true,
        flagged: true,
        flaggedAt: FieldValue.serverTimestamp(),
        flagReason: 'blocklist',
      });

    console.log(`[QPe Moderation] Commento ${commentId} nascosto (contenuto inappropriato)`);
  }
);

/**
 * Moderazione automatica risposte ai commenti.
 */
exports.moderateReply = onDocumentCreated(
  'polls/{pollId}/comments/{commentId}/replies/{replyId}',
  async (event) => {
    const reply = event.data?.data();
    if (!reply || !containsBlocklisted(reply.text)) return;

    const { pollId, commentId, replyId } = event.params;
    await db.collection('polls').doc(pollId)
      .collection('comments').doc(commentId)
      .collection('replies').doc(replyId).update({
        hidden: true,
        flagged: true,
        flaggedAt: FieldValue.serverTimestamp(),
        flagReason: 'blocklist',
      });

    console.log(`[QPe Moderation] Risposta ${replyId} nascosta (contenuto inappropriato)`);
  }
);

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
