import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Plugin: genera public/firebase-messaging-sw.js con le env vars iniettate
function firebaseSwPlugin() {
  return {
    name: 'generate-firebase-messaging-sw',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, 'VITE_');
      const sw = `// Auto-generato da vite.config.js — non modificare manualmente
importScripts('https://www.gstatic.com/firebasejs/11.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '${env.VITE_FIREBASE_API_KEY || ''}',
  authDomain: '${env.VITE_FIREBASE_AUTH_DOMAIN || ''}',
  projectId: '${env.VITE_FIREBASE_PROJECT_ID || ''}',
  storageBucket: '${env.VITE_FIREBASE_STORAGE_BUCKET || ''}',
  messagingSenderId: '${env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}',
  appId: '${env.VITE_FIREBASE_APP_ID || ''}',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  const d = payload.data || {};
  self.registration.showNotification(n.title || d.title || 'QPé', {
    body: n.body || d.body || '',
    icon: '/qpe_logo.svg',
    badge: '/favicon.svg',
    data: d,
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
`;
      writeFileSync(resolve(config.root, 'public/firebase-messaging-sw.js'), sw, 'utf-8');
    },
  };
}

export default defineConfig({
  plugins: [react(), firebaseSwPlugin()],
});
