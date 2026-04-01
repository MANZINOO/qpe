import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

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
        getUserProfile(firebaseUser.uid).then(async (profile) => {
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
            setUserProfile(profile);
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
    await setDoc(doc(db, 'users', uid), data);
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
      return updated;
    } catch (err) {
      console.warn('[QPe] Errore aggiornamento profilo:', err.message);
      // Aggiorna localmente
      const updated = { ...userProfile, ...data };
      setUserProfile(updated);
      return updated;
    }
  }

  // Segui un utente
  async function followUser(targetUid) {
    if (!user || user.uid === targetUid) return;
    // Senza try/catch: l'errore si propaga a chi chiama, così la UI non aggiorna se Firestore fallisce
    await updateDoc(doc(db, 'users', user.uid), {
      following: arrayUnion(targetUid)
    });
    await updateDoc(doc(db, 'users', targetUid), {
      followers: arrayUnion(user.uid)
    });
    setUserProfile(prev => {
      if (!prev) return prev;
      const following = prev.following || [];
      if (following.includes(targetUid)) return prev;
      return { ...prev, following: [...following, targetUid] };
    });
  }

  // Smetti di seguire un utente
  async function unfollowUser(targetUid) {
    if (!user || user.uid === targetUid) return;
    await updateDoc(doc(db, 'users', user.uid), {
      following: arrayRemove(targetUid)
    });
    await updateDoc(doc(db, 'users', targetUid), {
      followers: arrayRemove(user.uid)
    });
    setUserProfile(prev => ({
      ...prev,
      following: (prev.following || []).filter(f => f !== targetUid)
    }));
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
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
