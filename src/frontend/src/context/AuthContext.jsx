import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, writeBatch, deleteField, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { createNotification } from '../utils/notifications';
import { registerFcmToken } from '../utils/fcm';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ascolta i cambiamenti di stato auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Imposta loading=false subito: sappiamo già se l'utente è loggato o no
      // Il profilo Firestore si carica in background (non blocca il render)
      setLoading(false);

      if (firebaseUser) {
        // Carica il profilo in background senza bloccare il rendering
        getUserProfile(firebaseUser.uid).then(async (profileData) => {
          let profile = profileData;
          if (!profile) {
            await createUserProfile(firebaseUser.uid, {
              username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              bio: '',
              avatar: firebaseUser.photoURL || '',
              categories: [],
              createdAt: new Date().toISOString()
            });
            const newProfile = await getUserProfile(firebaseUser.uid);
            setUserProfile(newProfile);
          } else {
            // Auto-upgrade da limited a normal dopo 24h dalla registrazione
            if (profile.userMode === 'limited' && profile.registeredAt) {
              const registeredMs = profile.registeredAt?.toDate?.()?.getTime() || new Date(profile.registeredAt).getTime();
              const elapsed = Date.now() - registeredMs;
              if (elapsed >= 24 * 60 * 60 * 1000) {
                await updateDoc(doc(db, 'users', firebaseUser.uid), { userMode: 'normal' });
                profile = { ...profile, userMode: 'normal' };
              }
            }
            setUserProfile(profile);
          }
          // Registra/aggiorna token FCM se il permesso è già stato concesso
          if (Notification?.permission === 'granted') {
            registerFcmToken(firebaseUser.uid);
          }
        }).catch((err) => {
          console.warn('[QPe] Errore caricamento profilo:', err.message);
          setUserProfile({
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'utente',
            email: firebaseUser.email || '',
            bio: '',
            avatar: firebaseUser.photoURL || '',
            categories: [],
            createdAt: new Date().toISOString()
          });
        });
      } else {
        setUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  // Registrazione con email e password
  async function signup(email, password, username) {
    // Step 1: Crea utente su Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Step 2: Aggiorna displayName (non critico se fallisce)
    try {
      await updateProfile(result.user, { displayName: username });
    } catch (err) {
      console.warn('[QPe] Errore updateProfile:', err.message);
    }

    // Step 3: Crea profilo su Firestore (non critico - verra creato al login)
    try {
      await createUserProfile(result.user.uid, {
        username,
        email,
        bio: '',
        avatar: '',
        categories: [],
        createdAt: new Date().toISOString()
      });
      const profile = await getUserProfile(result.user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.warn('[QPe] Errore creazione profilo Firestore:', err.message);
      // Usa profilo locale temporaneo
      setUserProfile({
        uid: result.user.uid,
        username,
        email,
        bio: '',
        avatar: '',
        categories: [],
        createdAt: new Date().toISOString()
      });
    }

    return result.user;
  }

  // Login con email e password
  async function login(email, password) {
    // Solo l'operazione Auth — il profilo viene caricato da onAuthStateChanged in background
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  // Login con Google
  async function loginWithGoogle() {
    // Solo l'operazione Auth — il profilo viene caricato da onAuthStateChanged in background
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }

  // Logout
  async function logout() {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  }

  // Crea profilo utente su Firestore
  async function createUserProfile(uid, data) {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      userMode: 'limited',
      violations: 0,
      registeredAt: serverTimestamp(),
    });
  }

  // Legge profilo utente da Firestore
  async function getUserProfile(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  }

  // Aggiorna profilo utente
  async function updateUserProfile(data) {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), data);
      const updated = await getUserProfile(user.uid);
      setUserProfile(updated);

      // Propaga username e/o avatar a tutti i sondaggi dell'utente
      const pollUpdate = {};
      if (data.username !== undefined) pollUpdate.authorUsername = data.username;
      if (data.avatar !== undefined) pollUpdate.authorAvatar = data.avatar;
      if (Object.keys(pollUpdate).length > 0) {
        const snap = await getDocs(query(collection(db, 'polls'), where('authorId', '==', user.uid)));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach(d => batch.update(d.ref, pollUpdate));
          await batch.commit();
        }
      }

      return updated;
    } catch (err) {
      console.warn('[QPe] Errore aggiornamento profilo:', err.message);
      const updated = { ...userProfile, ...data };
      setUserProfile(updated);
      return updated;
    }
  }

  // Segui un utente (o invia richiesta se profilo privato)
  async function followUser(targetUid) {
    if (!user || user.uid === targetUid) return;
    const targetSnap = await getDoc(doc(db, 'users', targetUid));
    const targetData = targetSnap.data();
    const username = userProfile?.username || user.displayName || 'Utente';

    if (targetData?.isPrivate) {
      // Profilo privato → invia richiesta
      await updateDoc(doc(db, 'users', targetUid), {
        followRequests: arrayUnion(user.uid)
      });
      createNotification(targetUid, {
        type: 'followRequest',
        fromUid: user.uid,
        fromUsername: username
      });
    } else {
      // Profilo pubblico → segui direttamente
      await updateDoc(doc(db, 'users', user.uid), { following: arrayUnion(targetUid) });
      await updateDoc(doc(db, 'users', targetUid), { followers: arrayUnion(user.uid) });
      createNotification(targetUid, { type: 'follow', fromUid: user.uid, fromUsername: username });
      setUserProfile(prev => {
        if (!prev) return prev;
        const following = prev.following || [];
        if (following.includes(targetUid)) return prev;
        return { ...prev, following: [...following, targetUid] };
      });
    }
  }

  // Smetti di seguire un utente (o annulla la richiesta pendente)
  async function unfollowUser(targetUid) {
    if (!user || user.uid === targetUid) return;
    // Rimuovi da followRequests (nel caso fosse ancora pendente)
    await updateDoc(doc(db, 'users', targetUid), {
      followRequests: arrayRemove(user.uid),
      followers: arrayRemove(user.uid)
    });
    await updateDoc(doc(db, 'users', user.uid), { following: arrayRemove(targetUid) });
    setUserProfile(prev => ({
      ...prev,
      following: (prev.following || []).filter(f => f !== targetUid)
    }));
  }

  // Accetta una richiesta di follow
  async function acceptFollowRequest(fromUid) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      followRequests: arrayRemove(fromUid),
      followers: arrayUnion(fromUid)
    });
    await updateDoc(doc(db, 'users', fromUid), { following: arrayUnion(user.uid) });
    // Notifica chi ha fatto la richiesta che è stato accettato
    const username = userProfile?.username || user.displayName || 'Utente';
    createNotification(fromUid, { type: 'follow', fromUid: user.uid, fromUsername: username });
  }

  // Rifiuta una richiesta di follow
  async function rejectFollowRequest(fromUid) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      followRequests: arrayRemove(fromUid)
    });
  }

  // Ricarica profilo dal server
  async function refreshProfile() {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) setUserProfile(profile);
    } catch (err) {
      console.warn('[QPe] Errore refresh profilo:', err.message);
    }
  }

  function enablePushNotifications() {
    if (!user) return Promise.resolve();
    return registerFcmToken(user.uid);
  }

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    getUserProfile,
    followUser,
    unfollowUser,
    refreshProfile,
    enablePushNotifications,
    acceptFollowRequest,
    rejectFollowRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
