import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Crea una notifica per un utente.
 * Non lancia errori — logga solo in console per non bloccare l'azione principale.
 *
 * @param {string} targetUid - UID dell'utente che riceve la notifica
 * @param {object} data
 * @param {string} data.type - 'follow' | 'vote' | 'like' | 'comment'
 * @param {string} data.fromUid - UID di chi ha generato l'azione
 * @param {string} data.fromUsername - username di chi ha generato l'azione
 * @param {string} [data.pollId] - ID del sondaggio (per vote/like/comment)
 * @param {string} [data.pollTitle] - titolo del sondaggio (per vote/like/comment)
 */
export async function createNotification(targetUid, data) {
  // Non notificare se stessi
  if (targetUid === data.fromUid) return;

  try {
    await addDoc(collection(db, 'users', targetUid, 'notifications'), {
      type: data.type,
      fromUid: data.fromUid,
      fromUsername: data.fromUsername,
      pollId: data.pollId || null,
      pollTitle: data.pollTitle || null,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[QPe] Errore creazione notifica:', err.message);
  }
}
