# TODO — QPé

Tutte le attività del progetto. Le attività completate sono archiviate nella sezione **Completato**.

---

## In corso / Prossimi step

### Feature
- [ ] Swipe verticale tra sondaggi (stile reel, mobile)
- [x] Infinite scroll / paginazione avanzata nel feed
- [ ] Approvazione follow (profilo privato)
- [ ] Algoritmo di raccomandazione feed "Per te"
- [x] Notifiche push (Firebase Cloud Messaging)

### Business
- [ ] Pagina `/advertise` per inserzionisti (media kit, prezzi, contatti)
- [ ] Media kit PDF scaricabile
- [ ] Bot moderazione automatica base

### Deploy
- [ ] Deploy frontend su Vercel o Firebase Hosting
- [ ] Configurare dominio personalizzato (`qpe.app`)
- [ ] Variabili d'ambiente su Vercel / Firebase
- [ ] Regole Firebase Storage per avatar (aggiungere a `firebase.json`)

---

## Completato

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
- [x] Bug fix: Home.jsx (tab vs activeTab), Settings.jsx (versione + alert→toast)

### Infrastruttura & Sicurezza
- [x] Setup repo GitHub con struttura corretta (docs/, src/, README, LICENSE, CHANGELOG)
- [x] Firebase Authentication — email/password + Google OAuth
- [x] Profilo utente su Firestore con fallback locale
- [x] Sicurezza: chiave API Firebase in variabili d'ambiente `.env` (non nel codice)
- [x] Regole Firestore complete: utenti, notifiche, sondaggi, commenti, conversazioni, messaggi
- [x] Firebase Storage per upload avatar

### GDPR & Privacy
- [x] Cookie Banner GDPR con 3 livelli di consenso (necessari, analytics, marketing)
- [x] Gestione preferenze cookie (revoca e aggiornamento in qualsiasi momento)
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
- [x] Contatore risposte sincronizzato con Firestore
- [x] Statistiche autore (lista votanti + liker con nickname)
- [x] Protezione autovoto e autolike
- [x] Modifica titolo e hashtag (solo autore)
- [x] Eliminazione sondaggio con pulizia commenti (solo autore)
- [x] Pulsante condivisione (Web Share API con fallback copia link)
- [x] Inoltro sondaggio in chat DM
- [x] Contatore visualizzazioni (esclude l'autore, non conta accessi multipli)

### Feed & Navigazione
- [x] Home feed dinamico con query Firestore
- [x] Tab "Per te" (solo loggati), "Seguiti" (solo loggati), "Tendenze" (tutti)
- [x] Filtro sondaggi per hashtag (`?tag=` query parameter)
- [x] Cache tab con invalidazione al cambio following
- [x] Skeleton loading e stati vuoti descrittivi

### Profilo & Sociale
- [x] Modifica profilo (username, bio) con salvataggio Firestore
- [x] Upload avatar profilo (Firebase Storage, compressione client-side 400×400px, JPEG 82%)
- [x] Follow / Unfollow utenti con notifica automatica
- [x] Profili pubblici (`/u/:uid`) con sondaggi dell'utente
- [x] Statistiche profilo (sondaggi, follower, seguiti)

### Notifiche
- [x] Notifiche in tempo reale (follow, voto, like, commento) con badge non letti
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
