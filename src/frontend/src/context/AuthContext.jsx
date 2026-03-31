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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            // Utente esiste su Auth ma non su Firestore - crea profilo
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
        } catch (err) {
          console.warn('[QPe] Errore caricamento profilo:', err.message);
          // Crea profilo locale temporaneo se Firestore non risponde
          setUserProfile({
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'utente',
            email: firebaseUser.email || '',
            bio: '',
            avatar: firebaseUser.photoURL || '',
            categories: [],
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
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
    const result = await signInWithEmailAndPassword(auth, email, password);

    try {
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
        // Profilo mancante su Firestore - crealo
        await createUserProfile(result.user.uid, {
          username: result.user.displayName || email.split('@')[0],
          email,
          bio: '',
          avatar: result.user.photoURL || '',
          categories: [],
          createdAt: new Date().toISOString()
        });
        profile = await getUserProfile(result.user.uid);
      }
      setUserProfile(profile);
    } catch (err) {
      console.warn('[QPe] Errore caricamento profilo al login:', err.message);
      setUserProfile({
        uid: result.user.uid,
        username: result.user.displayName || email.split('@')[0],
        email,
        bio: '',
        avatar: result.user.photoURL || '',
        categories: [],
        createdAt: new Date().toISOString()
      });
    }

    return result.user;
  }

  // Login con Google
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);

    try {
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await createUserProfile(result.user.uid, {
          username: result.user.displayName || 'utente',
          email: result.user.email,
          bio: '',
          avatar: result.user.photoURL || '',
          categories: [],
          createdAt: new Date().toISOString()
        });
        profile = await getUserProfile(result.user.uid);
      }
      setUserProfile(profile);
    } catch (err) {
      console.warn('[QPe] Errore profilo Google login:', err.message);
      setUserProfile({
        uid: result.user.uid,
        username: result.user.displayName || 'utente',
        email: result.user.email || '',
        bio: '',
        avatar: result.user.photoURL || '',
        categories: [],
        createdAt: new Date().toISOString()
      });
    }

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
    try {
      // Aggiungi targetUid ai miei "following"
      await updateDoc(doc(db, 'users', user.uid), {
        following: arrayUnion(targetUid)
      });
      // Aggiungi il mio uid ai "followers" del target
      await updateDoc(doc(db, 'users', targetUid), {
        followers: arrayUnion(user.uid)
      });
      // Aggiorna profilo locale
      setUserProfile(prev => ({
        ...prev,
        following: [...(prev.following || []), targetUid]
      }));
    } catch (err) {
      console.warn('[QPe] Errore follow:', err.message);
    }
  }

  // Smetti di seguire un utente
  async function unfollowUser(targetUid) {
    if (!user || user.uid === targetUid) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        following: arrayRemove(targetUid)
      });
      await updateDoc(doc(db, 'users', targetUid), {
        followers: arrayRemove(user.uid)
      });
      setUserProfile(prev => ({
        ...prev,
        following: (prev.following || []).filter(uid => uid !== targetUid)
      }));
    } catch (err) {
      console.warn('[QPe] Errore unfollow:', err.message);
    }
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
