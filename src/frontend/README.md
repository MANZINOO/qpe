# QPé — Frontend

Applicazione React + Vite per il social network QPé.

## Avvio

```bash
# Installa dipendenze
npm install

# Copia le variabili d'ambiente
cp .env.example .env
# Inserisci i valori Firebase nel file .env

# Server di sviluppo (http://localhost:5173)
npm run dev

# Build produzione
npm run build

# Anteprima build
npm run preview

# Lint
npm run lint
```

## Struttura `src/`

```
src/
├── components/
│   ├── BottomNav.jsx/.css       # Navigazione bottom mobile
│   ├── CookieBanner.jsx/.css    # Banner consenso cookie GDPR
│   ├── CookiePreferencesManager.jsx  # Gestione preferenze cookie
│   ├── Footer.jsx/.css          # Footer (solo login/signup/settings)
│   └── LoadingGif.jsx           # Spinner tema-aware
├── context/
│   ├── AuthContext.jsx          # Auth + profilo Firestore
│   ├── ThemeContext.jsx         # Dark/light theme
│   └── ToastContext.jsx         # Toast notifications
├── pages/
│   ├── Home.jsx/.css            # Feed principale con tab
│   ├── Login.jsx                # Login email/Google
│   ├── Signup.jsx               # Registrazione multi-step
│   ├── Profile.jsx              # Profilo personale
│   ├── Settings.jsx/.css        # Impostazioni (profilo, notifiche, privacy, account)
│   ├── CreatePoll.jsx/.css      # Creazione sondaggio
│   ├── PollView.jsx/.css        # Visualizzazione e voto sondaggio
│   ├── UserProfile.jsx/.css     # Profilo pubblico utente
│   ├── Notifications.jsx/.css   # Notifiche in tempo reale
│   ├── Search.jsx/.css          # Ricerca utenti e sondaggi
│   ├── Messages.jsx/.css        # Lista conversazioni DM
│   ├── Chat.jsx/.css            # Chat one-to-one
│   ├── PrivacyPolicy.jsx        # Privacy Policy
│   └── CookiePolicy.jsx         # Cookie Policy
├── utils/
│   ├── cookieConsent.js         # Gestione cookie GDPR (js-cookie)
│   ├── conversations.js         # Helper ID conversazioni DM
│   ├── imageUtils.js            # Compressione immagini client-side
│   └── notifications.js         # Creazione notifiche Firestore
├── App.jsx                      # Router + Provider wrapper
├── firebase.js                  # Inizializzazione Firebase (da .env)
├── App.css                      # Stili globali componente
└── index.css                    # Design system (variabili CSS, reset, utilities)
```

## Variabili d'ambiente

| Variabile | Descrizione |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

Vedi `.env.example` per il template.
