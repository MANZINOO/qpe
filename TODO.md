# TODO — QPé

Tutte le attività del progetto. Le attività completate sono archiviate nella sezione **Completato**.

---

## In corso / Prossimi step

### Feature
- [ ] Modalità normale e premium — definire limiti e vantaggi
- [ ] Media kit PDF scaricabile dalla pagina `/advertise`
- [ ] Onboarding — schermata selezione categorie al primo accesso (nuovi utenti)
- [ ] Condivisione sondaggio con Web Share API nativa in PollView (bottone share)

### Business
- [ ] Dominio personalizzato (`qpe.app`) su Firebase Hosting

### Tecnico
- [ ] Code splitting del bundle (attualmente ~890KB) con dynamic `import()`

---

## Completato

### Moderazione & Sicurezza
- [x] Bot moderazione automatica (Cloud Functions v2): `moderatePoll`, `moderateComment`, `moderateReply`
- [x] Blocklist ~55 termini IT/EN con eliminazione immediata del contenuto
- [x] Sistema violazioni: 3 infrazioni → `userMode: 'limited'`
- [x] Toast feedback all'utente tramite `onSnapshot` quando il contenuto viene rimosso
- [x] Modalità utente: `limited` (prime 24h + 3 violazioni) / `normal` / `premium`
- [x] Auto-upgrade limited → normal dopo 24h da `registeredAt`
- [x] Migrazione automatica account esistenti senza `userMode` → `normal`

### Reel & Navigazione
- [x] Swipe verticale tra sondaggi (stile reel, scroll-snap CSS-only) → `/reel`
- [x] Votazione inline nel reel con stesse regole di PollView (anti-doppio-voto, notifiche)
- [x] Back navigation corretto: `navigate(-1)` in UserProfile evita loop nella history
- [x] Icona reel nell'header aggiornata a griglia film

### Feed & Algoritmo
- [x] Algoritmo "Per te": scoring per categoria (+4), engagement (log voti), recency boost
- [x] Badge ✓ votato sulle card del feed home
- [x] Filtro poll nascosti dalla moderazione nel feed e nel reel

### Profili & Sociale
- [x] Profili privati (isPrivate toggle, approvazione follow, `authorIsPrivate` denormalizzato)
- [x] Accept/Reject richieste di follow nelle Notifiche
- [x] Feed privato — poll di profili privati filtrati da "Per te" e "Tendenze"

### Business
- [x] Pagina `/advertise` per inserzionisti (formati, pacchetti Starter/Growth/Enterprise, FAQ, CTA)

### Documentazione GPOI
- [x] Studio di fattibilità (docs/fattibilita/)
- [x] Requisiti funzionali e non funzionali (RF01–RF08, RNF01–RNF08)
- [x] Analisi economica: BEP, ROI, Payback, VAN, TIR
- [x] Project management: obiettivi SMART, team, fasi, rischi, KPI
- [x] GDPR & Cookie Policy completa
- [x] Gantt di progetto (Mermaid + Excel)
- [x] README manuale utente + guida sviluppatori (10 sezioni)
- [x] CHANGELOG con Keep a Changelog + Semantic Versioning
- [x] Cheatsheet Git e GitHub Tasks

### Infrastruttura & Sicurezza
- [x] Setup repo GitHub con struttura corretta (docs/, src/, README, LICENSE, CHANGELOG)
- [x] Firebase Authentication — email/password + Google OAuth
- [x] Profilo utente su Firestore con fallback locale
- [x] Sicurezza: chiave API Firebase in variabili d'ambiente `.env`
- [x] Regole Firestore complete: utenti, notifiche, sondaggi, commenti, conversazioni, messaggi
- [x] Firebase Storage per upload avatar
- [x] Cloud Functions v2 deploy (moderazione + push notifications)

### GDPR & Privacy
- [x] Cookie Banner GDPR con 3 livelli di consenso
- [x] Gestione preferenze cookie (revoca e aggiornamento)
- [x] Privacy Policy e Cookie Policy
- [x] Export dati personali in JSON (Art. 20 GDPR)
- [x] Eliminazione account con conferma testuale (Art. 17 GDPR)

### Sondaggi
- [x] Creazione sondaggio con preview live, color picker (8 preset) e hashtag (max 5)
- [x] Pagina voto coupé a schermo intero
- [x] Risultati nascosti fino al voto (zero bias)
- [x] Percentuali e barre risultati post-voto
- [x] Annullamento voto
- [x] Sistema like con toggle
- [x] Commenti con like e risposte annidate
- [x] Statistiche autore (lista votanti + liker con nickname)
- [x] Protezione autovoto e autolike
- [x] Modifica titolo e hashtag (solo autore)
- [x] Eliminazione sondaggio con pulizia commenti (solo autore)
- [x] Pulsante condivisione (Web Share API con fallback copia link)
- [x] Inoltro sondaggio in chat DM
- [x] Contatore visualizzazioni (esclude l'autore)
- [x] Vista autore: percentuali visibili senza votare, nessuna spunta ✓

### Feed & Navigazione
- [x] Home feed dinamico con query Firestore
- [x] Tab "Per te" (solo loggati), "Seguiti" (solo loggati), "Tendenze" (tutti)
- [x] Filtro sondaggi per hashtag (`?tag=` query parameter)
- [x] Cache tab con invalidazione al cambio following
- [x] Skeleton loading e stati vuoti descrittivi
- [x] Notifiche push (Firebase Cloud Messaging + Cloud Functions)

### Profilo & Sociale
- [x] Modifica profilo (username, bio) con salvataggio Firestore
- [x] Upload avatar profilo (Firebase Storage, compressione client-side 400×400px, JPEG 82%)
- [x] Follow / Unfollow utenti con notifica automatica
- [x] Profili pubblici (`/u/:uid`) con sondaggi dell'utente
- [x] Statistiche profilo (sondaggi, follower, seguiti)

### Notifiche
- [x] Notifiche in tempo reale (follow, voto, like, commento, followRequest)
- [x] Segna come letta / segna tutte lette
- [x] Navigazione diretta dal click sulla notifica

### Messaggi
- [x] Conversazioni DM one-to-one in tempo reale
- [x] Lista conversazioni con anteprima ultimo messaggio
- [x] Contatore messaggi non letti per conversazione
- [x] Inoltro sondaggio come messaggio in chat

### Ricerca
- [x] Ricerca utenti per username (prefix matching, min 2 caratteri)
- [x] Ricerca sondaggi per titolo

### UI/UX
- [x] Layout responsive full-width (mobile → tablet → desktop)
- [x] Tema dark Instagram-style
- [x] Tema chiaro (warm sand palette: `#f0ede8`)
- [x] Rilevamento automatico system preference (`prefers-color-scheme`)
- [x] Toggle tema manuale con salvataggio in `localStorage`
- [x] BottomNav mobile con badge notifiche e messaggi
- [x] Header sticky con backdrop-filter glassmorphism
- [x] Skeleton loading su tutte le pagine
- [x] Toast notifications (successo, errore, info)
- [x] Animazioni stagger sulle card e transizioni pagina
