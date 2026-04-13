const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Triggered ogni volta che viene creato un documento in
 * users/{userId}/notifications/{notifId}.
 * Legge il token FCM dell'utente destinatario e invia la push.
 */
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
