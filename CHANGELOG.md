# Changelog

Tutte le modifiche rilevanti a QPé sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
e il progetto adotta il [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.6.0] - 14-04-2026

### Aggiunto

- **Reel view** (`/reel`): vista a schermo intero con scroll-snap verticale, votazione inline con le stesse regole di PollView (anti-doppio-voto, notifica, firstVoters)
- **Pagina inserzionisti** (`/advertise`): formati pubblicitari, 3 pacchetti (Starter €299 / Growth €799 / Enterprise), FAQ e CTA
- **Profili privati**: toggle "Profilo privato" in Impostazioni, richiesta approvazione follow, campo `authorIsPrivate` denormalizzato sui poll per filtro efficiente
- **Accept/Reject richieste di follow** nella pagina Notifiche con pulsanti dedicati
- **Algoritmo "Per te"**: scoring lato client — categoria match (+4), engagement (log voti), recency boost (esponenziale)
- **Badge ✓ votato** sulle card del feed home per i sondaggi già votati dall'utente
- **Bot di moderazione automatica** (Cloud Functions v2):
  - `moderatePoll`: elimina poll con titolo/opzioni/hashtag inappropriati
  - `moderateComment`: elimina commenti inappropriati
  - `moderateReply`: elimina risposte inappropriate
  - Blocklist ~55 termini IT/EN
  - Toast feedback ("Ops, c'è stato un problema — Contenuto non consentito dalla community.") tramite `onSnapshot` con attesa max 8s
- **Sistema violazioni**: ogni contenuto eliminato dalla moderazione incrementa `violations` sull'autore; a 3 infrazioni → `userMode: 'limited'`
- **Modalità utente** (`userMode: limited | normal | premium`):
  - Nuovi account partono in `limited` per le prime 24h
  - Auto-upgrade a `normal` al login dopo 24h da `registeredAt`
  - Migrazione automatica degli account esistenti (senza campo `userMode`) a `normal`
  - Utenti `limited`: non possono creare sondaggi né commentare, possono votare

### Modificato

- Icona reel nell'header: da triangolo ▶ a griglia film ⊞ (più riconoscibile)
- `UserProfile.jsx`: back button usa `navigate(-1)` invece di `<Link to="/">` — evita loop nella history quando si arriva dal reel o da altre pagine
- `PollView.jsx`: il segno di spunta ✓ non appare più nella vista autore (opzione A e B)
- `BottomNav.jsx`: `/reel` e `/advertise` aggiunti a `hideOn` (pagine fullscreen)
- `Footer.css`: padding-bottom aggiunto per mobile, evita sovrapposizione con BottomNav
- Versione app aggiornata a `0.6.0` in Impostazioni → Info

### Corretto

- **Reel**: doppio voto causato da race condition — risolto con `votingRef` (useRef)
- **Reel**: caricamento doppio in React Strict Mode — risolto con `loadingInitialRef`
- **Reel**: nessun sondaggio caricato per via del filtro `createdAt >= 7 giorni` — rimosso il filtro data
- **BottomNav**: non si nascondeva su `/reel` — aggiunto a `hideOn`
- **Settings**: footer con link legali coperto dalla BottomNav su mobile — corretto con padding-bottom nel `Footer.css`

---

## [0.5.0] - 07-04-2026

### Aggiunto

- Logo SVG QPé e GIF di caricamento tema-aware (bianca/nera in base al tema attivo)
- Tema chiaro con palette warm sand (`--bg: #f0ede8`) — meno aggressiva del grigio puro
- Rilevamento automatico della system preference (`prefers-color-scheme`) come tema default
- Selettore tema visuale (Chiaro / Scuro) nella tab Account delle Impostazioni
- Footer ridisegnato: visibile solo su `/login`, `/signup`, `/settings`
- BottomNav esteso fino a 768px di larghezza schermo (era 600px)
- Inoltro sondaggio via messaggio diretto dal PollView con modale di ricerca utente
- Contatore visualizzazioni sul sondaggio (esclude l'autore, non conta accessi multipli)
- Tab "Per te" e "Seguiti" nascoste per utenti non loggati (mostra solo "Tendenze")
- Gestione preferenze notifiche (toggle per ogni tipo: like, commenti, follower, nuovi poll)
- Impostazioni privacy (visibilità voti passati, approvazione follow)
- Tab "Info" nelle Impostazioni con versione, licenza e link legali

### Modificato

- ThemeContext: `localStorage.setItem` solo su toggle manuale — la preferenza di sistema non viene più sovrascritta al primo caricamento
- Tutti gli header sticky aggiornati al colore warm sand in tema chiaro (`rgba(240, 237, 232, 0.88)`)

### Corretto

- **Home.jsx:** catch block di `loadPolls()` usava `tab` invece di `activeTab` — l'errore veniva scritto nella cache sbagliata per utenti non loggati
- **Home.jsx:** empty state (icone e testi) usava `tab` invece di `activeTab` — messaggio errato mostrato agli utenti non loggati
- **Settings.jsx:** versione mostrata come `0.1.0 (beta)` invece di `0.4.0`
- **Settings.jsx:** eliminazione account usava `alert()` nativo invece di `toast`
- Header Impostazioni: bottone indietro nascosto dall'header sticky — ristrutturato come flex row con `.settings-header`
- "Torna alla home" in Profile.jsx: rimosso `color: rgba(255,255,255,0.8)` inline — invisibile in tema chiaro
- Firestore: regole notifiche — `allow create` separato da `read/update/delete` per permettere notifiche tra utenti diversi
- Reply count: quando le risposte caricate non corrispondono al contatore, viene aggiornato anche su Firestore
- Auth pages: form centrato correttamente su tutti i formati schermo

---

## [0.4.0] - 31-03-2026

### Aggiunto

- Pagina creazione sondaggio (`/create`) con preview live, color picker 8 preset e hashtag (max 5)
- Pagina voto coupé (`/poll/:id`) a schermo intero con percentuali e barre risultati post-voto
- Annullamento voto cliccando nuovamente sulla propria scelta
- Sistema like con toggle (aggiungi/rimuovi)
- Pulsante condivisione sondaggio (Web Share API con fallback copia link)
- Home feed dinamico con sondaggi reali da Firestore
- Tab "Per te" (tutti i poll) e "Seguiti" (poll utenti seguiti)
- FAB (Floating Action Button) e icona `+` nell'header per creare sondaggi rapidamente
- Contatore voti e like visibile su ogni card nella home
- Statistiche autore: lista votanti (con scelta e colore) e lista liker
- Modifica profilo (username, bio) con pre-popolamento dai dati reali e salvataggio Firestore
- Follow/Unfollow utenti con notifica automatica al target
- Notifiche in tempo reale (follow, voto, like, commento) con badge non letti
- Pagine "Segna come letta" e "Segna tutte lette"
- Profili pubblici utente (`/u/:uid`) con sondaggi dell'utente
- Commenti sui sondaggi con like
- Risposte ai commenti (nested replies) con contatore sincronizzato
- Messaggi diretti one-to-one in tempo reale con lista conversazioni
- Ricerca utenti per username (prefix matching) e sondaggi per titolo
- Upload avatar con compressione client-side (max 400×400px, JPEG 82%) e barra di progresso
- Hashtag sui sondaggi con filtro nel feed tramite `?tag=`
- Inoltro sondaggio in chat DM

### Sicurezza

- Rimossa la chiave API Firebase hardcodata dal codice sorgente
- Aggiunta gestione tramite variabili d'ambiente Vite (`VITE_FIREBASE_*`)
- Aggiunto `.env` e `.env.local` al `.gitignore`
- Aggiunto `.env.example` come template per nuovi sviluppatori
- Regole Firestore complete: utenti, notifiche, sondaggi, commenti, conversazioni

### Corretto

- Autovoto bloccato: il creatore non può votare il proprio sondaggio
- Autolike bloccato: il creatore non può mettere like al proprio sondaggio
- Bug refresh: dopo un ricaricamento la pagina perdeva lo stato di voto e like (dipendenza `user?.uid` in `useEffect`)
- Votanti e liker mostrano il nickname reale invece dell'UID

### UI/UX

- Layout responsive full-width: da 2 colonne su mobile fino a 4 su desktop
- Tema dark Instagram-style su tutte le pagine
- Hover card con `translateY(-4px)` e `box-shadow`
- Hint "Hai votato X — clicca per annullare" sotto la coupé post-voto
- Banner autore "Sei il creatore — non puoi votare"
- Skeleton loading e stati vuoti su tutte le pagine
- Toast notifications (successo, errore, info)

---

## [0.1.0] - 29-03-2026

### Aggiunto

- Setup iniziale del repository con struttura cartelle
- Inizializzazione progetto React con Vite + Firebase
- Firebase Authentication (email/password + Google OAuth)
- Profilo utente su Firestore con fallback locale
- Registrazione con selezione categorie di interesse (12 opzioni)
- Cookie Banner GDPR con 3 livelli di consenso (necessari, analytics, marketing)
- Privacy Policy completa
- Cookie Policy
- Funzioni export dati personali (JSON) e eliminazione account
- Documentazione GDPR in `docs/cookies_gdpr/`
- Studio di fattibilità in `docs/fattibilita/`
- Requisiti funzionali RF01–RF08 e non funzionali RNF01–RNF08
- Analisi economica e break-even point in `docs/economy_finance/`

---

## [0.0.1] - 2026-03-28

### Aggiunto

- Init del repository
- Struttura base: `docs/`, `src/`, `README.md`, `LICENSE`, `CHANGELOG.md`
