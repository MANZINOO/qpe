# Changelog

Tutte le modifiche rilevanti al progetto QPé sono documentate in questo file.

## [0.4.0] - 2026-03-31

### Sicurezza
- Rimossa la chiave API Firebase hardcodata dal codice sorgente
- Aggiunta gestione tramite variabili d'ambiente Vite (`VITE_FIREBASE_*`)
- Aggiunto `.env` e `.env.local` al `.gitignore` per evitare esposizione accidentale
- Aggiunto `.env.example` come template sicuro per nuovi sviluppatori

### Aggiunto
- Pagina creazione sondaggio (`/create`) con preview live della coupé, color picker e selezione categoria
- Pagina visualizzazione e voto sondaggio (`/poll/:id`) con layout coupé a schermo intero
- Sistema di voto: percentuali e barre risultati mostrate dopo il voto
- Annullamento voto: cliccando nuovamente sulla propria scelta il voto viene rimosso
- Sistema like con toggle (aggiungi/rimuovi)
- Pulsante condivisione sondaggio (Web Share API con fallback copia link)
- Home page dinamica con caricamento poll reali da Firestore
- Tab "Per te" (tutti i poll) e "Seguiti" (poll degli utenti seguiti) nella home
- FAB (Floating Action Button) e icona `+` nell'header per creare sondaggi rapidamente
- Contatore voti e like visibile su ogni card nella home
- Sezione Statistiche per l'autore del sondaggio: lista votanti (con scelta e colore) e lista liker
- Modifica profilo in Impostazioni con username e bio pre-popolati dai dati reali dell'utente
- Salvataggio modifiche profilo direttamente su Firestore

### Corretto
- Autovoto bloccato: il creatore di un sondaggio non può votare il proprio sondaggio
- Autolike bloccato: il creatore di un sondaggio non può mettere like al proprio sondaggio
- Al posto del pulsante like disabilitato per l'autore appare direttamente il pulsante Statistiche
- Bug refresh: dopo un aggiornamento della pagina lo stato di voto e like veniva perso; risolto aggiungendo `user?.uid` alle dipendenze di `useEffect` (Firebase Auth è asincrono)
- Votanti e liker ora mostrano il nickname reale invece dell'UID numerico
- Formato di salvataggio voti aggiornato: ora include `{uid, username, choice, votedAt}`
- Formato di salvataggio like aggiornato: ora include `{uid, username}`
- Compatibilità retroattiva con like salvati in vecchio formato (stringa UID)

### UI/UX
- Layout responsive full-width: rimosso il limite a 480px, l'app si adatta a qualsiasi schermo
- Griglia feed adattiva: da 2 colonne su mobile fino a 4-5 colonne su desktop (`auto-fill minmax`)
- Tema dark Instagram-style su tutte le pagine (Home, Auth, Profile, Settings, Legal, Cookie Banner)
- Logo bicolore `qp` bianco + `e` blu accento in tutte le pagine
- Hover sulle card poll con animazione `translateY` e box-shadow
- Hint visivo "Hai votato X — clicca di nuovo per annullare" sotto la coupé dopo il voto
- Banner blu "Sei il creatore — non puoi votare" per l'autore
- Statistiche autore con sfondo `bg-card` integrato sotto la action bar

---

## [0.1.0] - 2026-03-29

### Aggiunto
- Setup iniziale del repository con struttura cartelle
- Inizializzazione progetto React con Vite
- Cookie Banner GDPR con 3 livelli di consenso (necessari, analytics, marketing)
- Privacy Policy completa
- Documentazione GDPR in `docs/cookies_gdpr/`
- Funzioni export e delete dati utente
