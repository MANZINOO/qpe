import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Cache in memoria: dati sempre freschi ad ogni sessione, niente dati stantii su mobile
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

export { db };
export const googleProvider = new GoogleAuthProvider();

// Remote Config — intervallo breve per demo (60s), in produzione usare 3600s
export const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 60_000;
remoteConfig.defaultConfig = {
  banned_uids: '[]',
  banned_usernames: '[]',
  max_polls_per_day: '3',
};

export const functions = getFunctions(app);

export default app;
