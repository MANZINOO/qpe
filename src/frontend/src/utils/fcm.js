import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import app, { db } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let _messaging = null;

function getMsg() {
  if (!_messaging) _messaging = getMessaging(app);
  return _messaging;
}

/**
 * Chiede il permesso per le notifiche push e salva il token FCM su Firestore.
 * Da chiamare dopo il login, solo se l'utente non ha già negato il permesso.
 */
export async function registerFcmToken(userId) {
  if (!userId) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission === 'denied') return;

  try {
    // Assicura che il service worker sia registrato e attivo
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const token = await getToken(getMsg(), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await updateDoc(doc(db, 'users', userId), { fcmToken: token });
    }
  } catch (err) {
    // Non bloccare il flusso: le notifiche push sono opzionali
    console.warn('[QPe] FCM token non ottenuto:', err.message);
  }
}

/**
 * Listener per messaggi FCM in foreground.
 * Ritorna la funzione di unsubscribe.
 */
export function onForegroundMessage(callback) {
  try {
    return onMessage(getMsg(), callback);
  } catch {
    return () => {};
  }
}
