# QPé — Social Network basato su Sondaggi Binari

QPé è un social network incentrato su sondaggi binari chiamati **coupé**. La schermata di voto è divisa in due metà, una per ogni opzione — l'utente sceglie, vede i risultati in tempo reale e interagisce con la community.

> Progetto scolastico GPOI — Anno 2025/2026

---

## Stack Tecnico

| Layer | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Auth | Firebase Authentication (email + Google OAuth) |
| Database | Cloud Firestore |
| Hosting | Firebase / Vercel (da configurare) |
| Stile | CSS custom — tema dark |
| Font | Inter (Google Fonts) |

---

## Funzionalità implementate

- Autenticazione email/password e Google OAuth
- Registrazione con selezione categorie di interesse
- Home feed con sondaggi in tempo reale da Firestore
- Tab "Per te" (tutti i poll) e "Seguiti"
- Creazione sondaggio con preview live e color picker
- Pagina voto coupé a schermo intero con percentuali post-voto
- Annullamento voto
- Sistema like con toggle
- Statistiche autore (chi ha votato, chi ha messo like)
- Protezione autovoto e autolike
- Modifica profilo (username, bio) con salvataggio su Firestore
- Cookie Banner GDPR con 3 livelli di consenso
- Privacy Policy e Cookie Policy
- Export dati personali (JSON) e eliminazione account
- Layout responsive (mobile, tablet, desktop)

---

## Avvio Rapido

### Prerequisiti
- Node.js 18+
- Account Firebase con progetto creato

### Setup

```bash
# 1. Clona il repository
git clone https://github.com/tuo-username/qpe.git
cd qpe/src/frontend

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.example .env
# Apri .env e inserisci i tuoi valori Firebase

# 4. Avvia il server di sviluppo
npm run dev
```

### Variabili d'ambiente

Crea un file `.env` in `src/frontend/` copiando `.env.example` e inserendo i valori del tuo progetto Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> ⚠️ Non committare mai il file `.env` su GitHub. È già incluso nel `.gitignore`.

### Regole Firestore

Pubblica queste regole nella console Firebase → Firestore → Regole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /polls/{pollId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null
        && resource.data.authorId == request.auth.uid;
    }
  }
}
```

---

## Struttura Repository

```
qpe/
├── docs/
│   ├── fattibilita/
│   │   ├── README.md
│   │   └── requirements/
│   ├── economy_finance/
│   │   └── break_even_point.md
│   └── cookies_gdpr/
│       └── README.md
├── src/
│   └── frontend/
│       ├── src/
│       │   ├── components/     # CookieBanner, Footer, ecc.
│       │   ├── context/        # AuthContext
│       │   ├── pages/          # Home, Login, Signup, Profile, Settings, CreatePoll, PollView, ...
│       │   ├── utils/          # cookieConsent.js
│       │   └── firebase.js     # Config Firebase (usa variabili .env)
│       ├── .env.example
│       ├── .gitignore
│       └── package.json
├── README.md
├── CHANGELOG.md
├── TODO.md
└── LICENSE
```

---

## Licenza

MIT License — vedi [LICENSE](LICENSE).
