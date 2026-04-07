import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * ID deterministico: i due uid vengono ordinati alfabeticamente e uniti con '_'.
 * Garantisce che la stessa coppia di utenti abbia sempre lo stesso convId.
 */
export function getConvId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

/**
 * Crea la conversazione su Firestore se non esiste ancora.
 * Ritorna il convId.
 */
export async function getOrCreateConversation(me, target) {
  // me e target sono oggetti { uid, username, avatar }
  const convId = getConvId(me.uid, target.uid);
  const convRef = doc(db, 'conversations', convId);
  const snap = await getDoc(convRef);

  if (!snap.exists()) {
    await setDoc(convRef, {
      participants: [me.uid, target.uid],
      participantUsernames: {
        [me.uid]: me.username,
        [target.uid]: target.username
      },
      participantAvatars: {
        [me.uid]: me.avatar || '',
        [target.uid]: target.avatar || ''
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastMessageUid: '',
      unreadCounts: { [me.uid]: 0, [target.uid]: 0 },
      createdAt: serverTimestamp()
    });
  }

  return convId;
}
