<p align="center">
  <img src="images_qpe/qpe_logo.svg" alt="QPé logo" width="160"/>
</p>

# QPé — Social Network dei Sondaggi Binari

![Versione](https://img.shields.io/badge/versione-0.4.0-blue)
![Licenza](https://img.shields.io/badge/licenza-MIT-green)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase)
![Stato](https://img.shields.io/badge/stato-beta-orange)

> Progetto scolastico GPOI — Anno 2025/2026

---

## Indice

1. [Cos'è QPé](#1-cosè-qpé)
2. [Come funziona](#2-come-funziona)
3. [Guida utente](#3-guida-utente)
   - [Registrazione e accesso](#registrazione-e-accesso)
   - [Il feed home](#il-feed-home)
   - [Votare un sondaggio](#votare-un-sondaggio)
   - [Creare un sondaggio](#creare-un-sondaggio)
   - [Profilo e impostazioni](#profilo-e-impostazioni)
   - [Seguire altri utenti](#seguire-altri-utenti)
   - [Notifiche e messaggi](#notifiche-e-messaggi)
   - [Ricerca](#ricerca)
   - [Temi e accessibilità](#temi-e-accessibilità)
4. [Funzionalità complete](#4-funzionalità-complete)
5. [Stack tecnico](#5-stack-tecnico)
6. [Setup sviluppatori](#6-setup-sviluppatori)
7. [Struttura repository](#7-struttura-repository)
8. [Sicurezza e GDPR](#8-sicurezza-e-gdpr)
9. [Documentazione](#9-documentazione)
10. [Licenza](#10-licenza)

---

## 1. Cos'è QPé

**QPé** è un social network incentrato sui **sondaggi binari**, chiamati *coupé*. Ogni sondaggio presenta esattamente due opzioni visive — una in cima e una in basso — e l'utente deve scegliere una delle due prima di vedere i risultati.

L'idea nasce da un'osservazione semplice: le domande più coinvolgenti sono quelle che ti obbligano a scegliere tra due soli lati. QPé trasforma questo meccanismo in un'esperienza social: voti, vedi le percentuali in tempo reale, scopri cosa pensano gli altri e partecipi alla discussione.

### Cosa rende QPé diverso

| Caratteristica | QPé | Altri social |
|---|---|---|
| Formato domanda | Solo binario (A vs B) | Testo libero / multi-risposta |
| Risultati | Nascosti fino al voto | Spesso visibili subito |
| Interfaccia voto | Schermo diviso a metà (coupé) | Bottoni / opzioni testuali |
| Focus | Solo sondaggi | Contenuti misti |
| Bias di conferma | Eliminato (vedi prima, scegli poi) | Presente |

---

## 2. Come funziona

```
┌─────────────────────────────┐
│                             │
│       OPZIONE  A            │  ← Tocca/clicca per votare A
│                             │
├─────────────────────────────┤  ← Divisore (si sposta dopo il voto)
│                             │
│       OPZIONE  B            │  ← Tocca/clicca per votare B
│                             │
└─────────────────────────────┘
```

1. **Prima del voto** — vedi solo le due opzioni colorate, nessun risultato
2. **Voti** — tocca la metà che preferisci
3. **Dopo il voto** — il divisore si sposta mostrando le percentuali in tempo reale
4. **Annulli** — puoi ritirare il voto toccando di nuovo la tua scelta

---

## 3. Guida utente

### Registrazione e accesso

**Registrarsi con email:**
1. Apri QPé e tocca **Accedi** → **Non hai un account? Registrati**
2. Scegli un **username** (min. 3 caratteri)
3. Inserisci **email** e **password** (min. 6 caratteri)
4. Seleziona le **categorie di interesse** (Sport, Musica, Tecnologia, ecc.) — aiutano a personalizzare il feed
5. Tocca **Inizia**

**Accedere con Google:**
- Tocca il pulsante **Continua con Google** sia nella registrazione che nel login
- Il profilo viene creato automaticamente

**Recuperare la password:**
- Vai su **Impostazioni → Account → Invia email di reset password**
- Riceverai un link all'email registrata

---

### Il feed home

La home mostra i sondaggi in tre tab:

| Tab | Contenuto | Chi può vederlo |
|---|---|---|
| **Per te** | Tutti i sondaggi recenti | Solo utenti loggati |
| **Seguiti** | Sondaggi degli utenti che segui | Solo utenti loggati |
| **Tendenze** | Top sondaggi degli ultimi 7 giorni per voti | Tutti |

> Gli utenti non loggati vedono solo la tab **Tendenze**.

**Filtrare per hashtag:**
- Clicca su un `#hashtag` su qualsiasi card per vedere solo i sondaggi con quel tag
- Rimuovi il filtro con la × nella barra in cima al feed

---

### Votare un sondaggio

1. Clicca su una card nel feed per aprire il sondaggio a schermo intero
2. Tocca la **metà superiore** (Opzione A) o la **metà inferiore** (Opzione B)
3. Appariranno le percentuali e un indicatore della tua scelta
4. Per **annullare il voto**: tocca di nuovo la tua scelta
5. Per **mettere like**: tocca il cuore ♥ nella barra azioni (non disponibile per l'autore del sondaggio)

**Condividere un sondaggio:**
- Tocca il pulsante di condivisione per aprire il menu nativo del dispositivo
- Oppure copia il link direttamente

**Inoltrare in chat:**
- Tocca l'icona freccia → cerca un utente → il sondaggio arriva come messaggio diretto

---

### Creare un sondaggio

1. Tocca il pulsante **+** nell'header o nel menu bottom (mobile)
2. Compila i campi:
   - **Domanda** — es. "Pizza o sushi?" (max 120 caratteri)
   - **Opzione A** — testo (max 40 caratteri) + colore
   - **Opzione B** — testo (max 40 caratteri) + colore
   - **Hashtag** — da 1 a 5 tag (premi Invio o virgola per aggiungere)
3. La **preview** in tempo reale mostra come apparirà la coupé
4. Tocca **Pubblica sondaggio**

> Per creare sondaggi è necessario aver accettato tutti i cookie (necessari, analytics e marketing).

**Come autore puoi:**
- Modificare titolo e hashtag dopo la pubblicazione (icona matita)
- Eliminare il sondaggio (icona cestino) — vengono rimossi anche tutti i commenti
- Vedere le statistiche complete: lista di chi ha votato cosa e chi ha messo like

---

### Profilo e impostazioni

**Profilo personale** (`/profile`):
- Statistiche: numero di sondaggi pubblicati, follower, seguiti
- Bio e categorie di interesse
- Foto profilo (clicca sull'avatar per caricare una nuova immagine)
- Pulsante **Modifica profilo** → Impostazioni
- Pulsante **Esci** per il logout

**Impostazioni** (`/settings`) — 5 tab:

| Tab | Cosa puoi fare |
|---|---|
| **Profilo** | Cambiare username, bio e foto profilo |
| **Notifiche** | Attivare/disattivare like, commenti, follower, nuovi sondaggi |
| **Privacy e Dati** | Visibilità voti, approvazione follow, cookie, export/eliminazione dati |
| **Account** | Reset password, selezione tema chiaro/scuro |
| **Info** | Versione app, licenza, link legali |

**Caricare una foto profilo:**
1. Vai su Impostazioni → Profilo oppure clicca l'avatar nella pagina Profilo
2. Seleziona un'immagine (JPG, PNG, WebP — max 10 MB)
3. L'immagine viene compressa automaticamente a 400×400px prima dell'upload
4. Tocca **Salva modifiche**

---

### Seguire altri utenti

- Apri il **profilo pubblico** di un utente cliccando sul suo username (ovunque nel feed o nelle notifiche)
- Tocca **Segui** — l'utente riceverà una notifica
- Per smettere di seguire: torna sul profilo e tocca **Segui già**
- I sondaggi degli utenti seguiti appaiono nella tab **Seguiti** del feed

---

### Notifiche e messaggi

**Notifiche** (`/notifications`):

Ricevi una notifica quando:
- Qualcuno ti inizia a seguire
- Qualcuno vota il tuo sondaggio
- Qualcuno mette like al tuo sondaggio
- Qualcuno commenta il tuo sondaggio

Tocca una notifica per andare direttamente alla pagina relativa. Il badge rosso sull'icona mostra le notifiche non lette.

**Messaggi diretti** (`/messages`):
- Tocca l'icona chat per vedere tutte le conversazioni
- Apri una conversazione per chattare in tempo reale
- Puoi inviare sondaggi direttamente in chat (dal pulsante "Inoltra" sul sondaggio)

---

### Ricerca

Vai su **Cerca** (`/search`) e scegli la tab:

- **Utenti** — cerca per username (inizia a digitare, almeno 2 caratteri)
- **Sondaggi** — cerca per titolo

Clicca su un risultato per aprire il profilo o il sondaggio.

---

### Temi e accessibilità

QPé supporta **tema scuro** e **tema chiaro**:

- Al primo avvio rileva automaticamente la preferenza del sistema operativo
- Puoi cambiarlo manualmente da **Impostazioni → Account → Tema**
- La scelta viene salvata e ricordata anche dopo la chiusura dell'app

---

## 4. Funzionalità complete

### Autenticazione
- [x] Registrazione email/password con selezione categorie di interesse
- [x] Login email/password
- [x] Login e registrazione con Google OAuth
- [x] Logout
- [x] Reset password via email

### Sondaggi (Coupé)
- [x] Creazione con preview live, color picker (8 preset) e hashtag (max 5)
- [x] Interfaccia voto coupé a schermo intero
- [x] Risultati nascosti fino al voto (zero bias)
- [x] Annullamento voto
- [x] Sistema like con toggle
- [x] Commenti e risposte annidate (like ai commenti)
- [x] Statistiche autore (chi ha votato cosa, chi ha messo like)
- [x] Modifica titolo e hashtag (solo autore)
- [x] Eliminazione con pulizia commenti (solo autore)
- [x] Condivisione via Web Share API
- [x] Inoltro in messaggi diretti
- [x] Contatore visualizzazioni (esclude l'autore)
- [x] Protezione autovoto e autolike

### Feed & Navigazione
- [x] Tab "Per te", "Seguiti", "Tendenze"
- [x] Filtro per hashtag con `?tag=` query parameter
- [x] Cache per tab (invalidata al cambio following)
- [x] Skeleton loading e stati vuoti

### Profilo & Sociale
- [x] Profilo personale con statistiche
- [x] Upload avatar con compressione client-side (max 400×400px, JPEG 82%)
- [x] Follow/Unfollow con notifica automatica
- [x] Profili pubblici (`/u/:uid`)

### Notifiche & Messaggi
- [x] Notifiche real-time (follow, voto, like, commento)
- [x] Badge non letti su header e BottomNav
- [x] Segna come letta / segna tutte lette
- [x] DM one-to-one in tempo reale
- [x] Inoltro sondaggio in chat

### Ricerca
- [x] Ricerca utenti per username (prefix matching)
- [x] Ricerca sondaggi per titolo

### UI/UX
- [x] Tema dark/light con rilevamento system preference
- [x] Toggle manuale con salvataggio in localStorage
- [x] Layout responsive: mobile → tablet → desktop
- [x] BottomNav mobile con badge
- [x] Header sticky con backdrop-filter glassmorphism
- [x] Toast notifications (successo, errore, info)
- [x] Animazioni stagger e transizioni pagina

### GDPR & Privacy
- [x] Cookie Banner con 3 livelli di consenso
- [x] Gestione preferenze cookie (revoca in qualsiasi momento)
- [x] Privacy Policy e Cookie Policy
- [x] Export dati personali in JSON (Art. 20 GDPR)
- [x] Eliminazione account con conferma testuale (Art. 17 GDPR)

---

## 5. Stack tecnico

| Layer | Tecnologia | Versione |
|---|---|---|
| UI Framework | React | 19 |
| Build tool | Vite | 8 |
| Routing | React Router DOM | 7 |
| Auth | Firebase Authentication | 11 |
| Database | Cloud Firestore | 11 |
| Storage | Firebase Storage | 11 |
| Cookie management | js-cookie | 3.0.5 |
| Font | Inter | Google Fonts |
| Stile | CSS custom (variabili, no framework) | — |

### Architettura

```
src/
├── context/        # Stato globale (Auth, Theme, Toast)
├── pages/          # Una cartella per pagina/route
├── components/     # Componenti riutilizzabili
└── utils/          # Funzioni pure e helper Firebase
```

**Pattern principali:**
- `onSnapshot` per dati real-time (conversazioni, notifiche, messaggi)
- Cache per tab con invalidazione selettiva
- Profilo Firestore caricato in background (non blocca il render)
- ID conversazioni deterministici (UID ordinati alfabeticamente)
- Compressione immagini client-side prima dell'upload

---

## 6. Setup sviluppatori

### Prerequisiti

- Node.js 18+
- Account Firebase (Authentication, Firestore, Storage abilitati)

### Installazione

```bash
# 1. Clona il repository
git clone https://github.com/MANZINOO/qpe.git
cd qpe/src/frontend

# 2. Installa le dipendenze
npm install

# 3. Crea il file delle variabili d'ambiente
cp .env.example .env
```

Apri `.env` e inserisci i valori del tuo progetto Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> **Attenzione:** non committare mai il file `.env`. È già in `.gitignore`.

### Comandi disponibili

```bash
npm run dev       # Server di sviluppo con HMR (http://localhost:5173)
npm run build     # Build di produzione in dist/
npm run preview   # Anteprima locale della build
npm run lint      # Analisi statica del codice con ESLint
```

### Deploy Firestore rules

Pubblica le regole di sicurezza dal file `firestore.rules`:

```bash
# Con Firebase CLI
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Oppure copia il contenuto di `firestore.rules` direttamente nella console Firebase → Firestore → Regole.

---

## 7. Struttura repository

```
qpe/
├── docs/
│   ├── fattibilita/
│   │   ├── README.md                  # Studio di fattibilità
│   │   ├── gantt.md                   # Gantt di progetto (Mermaid) + WBS
│   │   ├── template_gantt.xlsx        # Gantt di progetto (Excel)
│   │   ├── ROI_Payback_VAN_TIR.md    # Indicatori di redditività
│   │   └── requirements/
│   │       ├── requirements_1.md      # Requisiti funzionali (RF01–RF08)
│   │       └── requirements_2.md      # Requisiti non funzionali (RNF01–RNF08)
│   ├── economy_finance/
│   │   └── break_even_point.md        # BEP, costi, ricavi, proiezioni
│   ├── cookies_gdpr/
│   │   └── README.md                  # Normativa GDPR e architettura consenso
│   ├── project_management/
│   │   └── README.md                  # Obiettivi SMART, team, fasi, rischi
│   └── github/
│       ├── CHEATSHEET.md              # Comandi Git e convenzioni commit
│       └── GITHUB_TASKS.md            # Issues, Pages, Release, checklist
├── src/
│   └── frontend/
│       ├── public/
│       │   ├── qpe_logo.svg
│       │   ├── loading_white.gif
│       │   └── loading_black.gif
│       ├── src/
│       │   ├── components/            # BottomNav, Footer, CookieBanner,
│       │   │                          # CookiePreferencesManager, LoadingGif
│       │   ├── context/               # AuthContext, ThemeContext, ToastContext
│       │   ├── pages/                 # Tutte le pagine dell'app
│       │   ├── utils/                 # cookieConsent, conversations,
│       │   │                          # imageUtils, notifications
│       │   ├── App.jsx                # Router + Provider wrapper
│       │   ├── firebase.js            # Inizializzazione Firebase
│       │   └── main.jsx               # Entry point React
│       ├── .env.example               # Template variabili d'ambiente
│       └── package.json
├── images_qpe/                        # Asset grafici (logo, icone, gif)
├── firebase.json                      # Configurazione Firebase CLI
├── firestore.rules                    # Regole sicurezza Firestore
├── README.md                          # Questo file
├── CHANGELOG.md                       # Cronologia delle versioni
├── TODO.md                            # Task completati e futuri
└── LICENSE                            # MIT License
```

---

## 8. Sicurezza e GDPR

### Regole Firestore

Le regole complete sono nel file `firestore.rules`. In sintesi:

| Risorsa | Lettura | Scrittura | Note |
|---|---|---|---|
| `users/{uid}` | Autenticati | Solo il proprietario | — |
| `users/{uid}/notifications` | Solo il destinatario | Qualsiasi autenticato | Per notifiche cross-user |
| `polls/{pollId}` | Chiunque | Autenticati | Eliminazione solo autore |
| `polls/{pollId}/comments` | Chiunque | Autenticati | Eliminazione solo autore commento |
| `conversations/{convId}` | Solo partecipanti | Solo partecipanti | — |

### Cookie e consenso

QPé usa tre categorie di cookie:

| Categoria | Cookie | Durata | Scopo |
|---|---|---|---|
| Necessari | `consent_preferences` | 12 mesi | Salva la scelta di consenso |
| Analytics | `_ga`, `_gid` | 2 anni / 1 giorno | Statistiche anonime d'uso |
| Marketing | `_qpe_sponsored` | 6 mesi | Sondaggi sponsorizzati |

La documentazione GDPR completa è in [`docs/cookies_gdpr/README.md`](docs/cookies_gdpr/README.md).

### Diritti dell'utente (GDPR)

- **Portabilità (Art. 20):** export dati in JSON da Impostazioni → Privacy e Dati → Scarica i miei dati
- **Oblio (Art. 17):** eliminazione account da Impostazioni → Privacy e Dati → Elimina il mio account
- **Revoca consenso:** gestione cookie da Impostazioni → Privacy e Dati → Preferenze cookie

---

## 9. Documentazione

| Documento | Percorso | Contenuto |
|---|---|---|
| Studio di fattibilità | `docs/fattibilita/README.md` | Analisi di mercato, fattibilità tecnica ed economica |
| Requisiti funzionali | `docs/fattibilita/requirements/requirements_1.md` | RF01–RF08 |
| Requisiti non funzionali | `docs/fattibilita/requirements/requirements_2.md` | RNF01–RNF08 (performance, scalabilità, sicurezza…) |
| Gantt di progetto | `docs/fattibilita/gantt.md` | Diagramma Gantt (Mermaid) + WBS |
| ROI / Payback / VAN / TIR | `docs/fattibilita/ROI_Payback_VAN_TIR.md` | Indicatori di redditività applicati a QPé |
| Break Even Point | `docs/economy_finance/break_even_point.md` | Costi, ricavi, BEP, proiezioni primo anno |
| GDPR & Cookie | `docs/cookies_gdpr/README.md` | Normativa, architettura consenso, diritti utente |
| Project Management | `docs/project_management/README.md` | Obiettivi SMART, team, fasi, rischi, KPI |
| Git Cheatsheet | `docs/github/CHEATSHEET.md` | Comandi Git essenziali e convenzioni commit |
| GitHub Tasks | `docs/github/GITHUB_TASKS.md` | Issues, Projects, Pages, Release, checklist |
| Changelog | `CHANGELOG.md` | Cronologia versioni (Keep a Changelog) |
| Todo | `TODO.md` | Task completati e roadmap |
| Frontend | `src/frontend/README.md` | Setup e struttura del codice frontend |

---

## 10. Licenza

Distribuito sotto licenza **MIT**. Vedi il file [LICENSE](LICENSE) per il testo completo.

```
MIT License — Copyright (c) 2026 QPE Team
```
