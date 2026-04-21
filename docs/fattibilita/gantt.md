Gantt — QPé
===========

v2.0.0 - 21/04/2026

Pianificazione temporale del progetto QPé suddivisa in 12 fasi.

> Il Gantt è disponibile anche in formato Excel nella stessa cartella: `gantt.xlsx`

---

# Gantt del Progetto

```mermaid
gantt
    title QPé — Piano di Progetto 2026
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Fase 1 — Avvio e doc.
    Studio di fattibilità, requisiti RF/RNF, analisi economica (BEP, ROI, Payback, VAN, TIR), piano PM (SMART, team, rischi, KPI), setup repository GitHub :done, f1, 2026-03-28, 2026-04-20

    section Fase 2 — Infrastruttura base
    React + Vite + Firebase, Auth email/Google OAuth, Firestore struttura dati, variabili d'ambiente, regole Firestore base :done, f2, 2026-03-28, 2026-04-05

    section Fase 3 — GDPR e Privacy
    Cookie Banner 3 livelli, Privacy Policy, Cookie Policy, export dati (Art. 20), eliminazione account (Art. 17), docs GDPR :done, f3, 2026-03-30, 2026-04-05

    section Fase 4 — Core sondaggi
    Creazione sondaggio (preview live, color picker, hashtag), voto coupé, risultati zero bias, annullamento voto, like, commenti e risposte annidate, statistiche autore, modifica ed eliminazione :done, f4, 2026-04-06, 2026-04-14

    section Fase 5 — Feed e navigazione
    Home feed Firestore, tab Per te / Seguiti / Tendenze, filtro hashtag, cache tab, skeleton loading, stati vuoti, BottomNav mobile + header sticky :done, f5, 2026-03-28, 2026-04-05

    section Fase 6 — Profilo e sociale
    Profilo personale con statistiche, upload avatar con compressione, follow/unfollow con notifica, profili pubblici (/u/:uid), ricerca utenti e sondaggi, messaggi diretti DM in tempo reale :done, f6, 2026-03-28, 2026-04-05

    section Fase 7 — Notifiche e push
    Notifiche in-app real-time (follow, voto, like, commento), badge non letti su BottomNav e header, Firebase Cloud Messaging push, Cloud Functions sendPushOnNotification, primo deploy Firebase Hosting :done, f7, 2026-03-28, 2026-04-05

    section Fase 8 — UI/UX avanzata
    Tema chiaro warm sand, rilevamento system preference, toggle manuale con localStorage, toast notifications, animazioni stagger e transizioni pagina, layout responsive tablet/desktop :done, f8, 2026-03-30, 2026-04-05

    section Fase 9 — Feature avanzate
    Reel view scroll-snap verticale, algoritmo Per te con scoring, profili privati e approvazione follow, accept/reject richieste follow, badge votato sulle card, vista autore con percentuali senza voto :done, f9, 2026-03-30, 2026-04-05

    section Fase 10 — Moderazione
    Bot moderazione: moderatePoll, moderateComment, moderateReply, blocklist 55 termini IT/EN, sistema violazioni (3 infrazioni → limited), toast feedback con onSnapshot, userMode limited/normal/premium, auto-upgrade dopo 24h :active, f10, 2026-03-30, 2026-04-30

    section Fase 11 — Business
    Pagina /advertise inserzionisti, pacchetti Starter (€299) / Growth (€799) / Enterprise :active, f11, 2026-04-05, 2026-04-30

    section Fase 12 — Completamento
    Media kit PDF, dominio personalizzato qpe.app, definizione modalità normal e premium, onboarding nuovi utenti : f12, 2026-04-15, 2026-04-30
```

---

# Milestone principali

| Milestone | Data | Versione | Stato |
|---|---|---|---|
| Init repository + struttura base | 28 Marzo 2026 | v0.0.1 | ✅ Completato |
| Auth + GDPR funzionanti | 29 Marzo 2026 | v0.1.0 | ✅ Completato |
| Feature core complete (sondaggi, feed, profili, DM, notifiche) | 31 Marzo 2026 | v0.4.0 | ✅ Completato |
| UI/UX completa (temi, reel, responsiveness, bug fix) | 7 Aprile 2026 | v0.5.0 | ✅ Completato |
| Moderazione automatica + userMode + /advertise | 14 Aprile 2026 | v0.6.0 | ✅ Completato |
| Onboarding + media kit + definizione premium | 30 Aprile 2026 | v0.7.0 | 🔄 In corso |
| Lancio pubblico + dominio qpe.app | Maggio 2026 | v1.0.0 | 📋 Pianificato |

---

# Riepilogo risorse

| Fase | % Completamento | Inizio | Fine | Settimane | Ore | Costo (€) |
|---|:---:|---|---|:---:|:---:|:---:|
| Fase 1 — Avvio e documentazione | 100% | 28-Mar | 20-Apr | 3 | 9 | 135 |
| Fase 2 — Infrastruttura base | 100% | 28-Mar | 5-Apr | 0 | 0 | 0 |
| Fase 3 — GDPR e Privacy | 100% | 30-Mar | 5-Apr | 1 | 3 | 45 |
| Fase 4 — Funzionalità core sondaggi | 100% | 6-Apr | 14-Apr | 0 | 0 | 0 |
| Fase 5 — Feed e navigazione | 100% | 28-Mar | 5-Apr | 0 | 0 | 0 |
| Fase 6 — Profilo e sociale | 100% | 28-Mar | 5-Apr | 1 | 3 | 45 |
| Fase 7 — Notifiche e push | 100% | 28-Mar | 5-Apr | 0 | 0 | 0 |
| Fase 8 — UI/UX avanzata | 100% | 30-Mar | 5-Apr | 1 | 3 | 45 |
| Fase 9 — Feature avanzate | 100% | 30-Mar | 5-Apr | 0 | 0 | 0 |
| Fase 10 — Moderazione e sicurezza | 60% | 30-Mar | 30-Apr | 4 | 12 | 180 |
| Fase 11 — Business e monetizzazione | 10% | 5-Apr | 30-Apr | 3 | 9 | 135 |
| Fase 12 — Completamento | 0% | 15-Apr | 30-Apr | 2 | 6 | 90 |
| **TOTALE** | | | | **17** | **51** | **€ 765** |

**Parametri di costo:**
- Hours × Week: **3 h**
- Costo Risorse Interne: **15 €/h**
- Costo Risorse Esterne: **25 €/h**

---

# WBS — Work Breakdown Structure

```
QPé
├── 1. Avvio e documentazione
│   ├── 1.1 Studio di fattibilità
│   ├── 1.2 Requisiti funzionali (RF01–RF08)
│   ├── 1.3 Requisiti non funzionali (RNF01–RNF08)
│   ├── 1.4 Analisi economica (BEP, ROI, Payback, VAN, TIR)
│   ├── 1.5 Piano di project management (SMART, team, rischi, KPI)
│   └── 1.6 Setup repository GitHub (struttura, LICENSE, README base)
├── 2. Infrastruttura base
│   ├── 2.1 Inizializzazione React + Vite + Firebase
│   ├── 2.2 Firebase Authentication (email/password + Google OAuth)
│   ├── 2.3 Firestore: struttura dati utenti e profili
│   ├── 2.4 Variabili d'ambiente e sicurezza chiavi API
│   └── 2.5 Regole Firestore base
├── 3. GDPR e Privacy
│   ├── 3.1 Cookie Banner con 3 livelli di consenso
│   ├── 3.2 Privacy Policy e Cookie Policy
│   ├── 3.3 Export dati personali (Art. 20 GDPR)
│   ├── 3.4 Eliminazione account (Art. 17 GDPR)
│   └── 3.5 Documentazione GDPR in docs/cookies_gdpr/
├── 4. Funzionalità core sondaggi
│   ├── 4.1 Creazione sondaggio (preview live, color picker, hashtag)
│   ├── 4.2 Pagina voto coupé a schermo intero
│   ├── 4.3 Sistema risultati (percentuali, barre, zero bias)
│   ├── 4.4 Annullamento voto e sistema like
│   ├── 4.5 Commenti e risposte annidate
│   ├── 4.6 Statistiche autore (votanti + liker)
│   └── 4.7 Modifica ed eliminazione sondaggio
├── 5. Feed e navigazione
│   ├── 5.1 Home feed dinamico con Firestore
│   ├── 5.2 Tab Per te / Seguiti / Tendenze
│   ├── 5.3 Filtro per hashtag (?tag=)
│   ├── 5.4 Cache tab con invalidazione
│   └── 5.5 Skeleton loading, stati vuoti, BottomNav + header sticky
├── 6. Profilo e sociale
│   ├── 6.1 Profilo personale con statistiche
│   ├── 6.2 Upload avatar con compressione client-side
│   ├── 6.3 Follow/Unfollow con notifica automatica
│   ├── 6.4 Profili pubblici (/u/:uid)
│   ├── 6.5 Ricerca utenti e sondaggi
│   └── 6.6 Messaggi diretti (DM) one-to-one in tempo reale
├── 7. Notifiche e push
│   ├── 7.1 Notifiche in-app real-time (follow, voto, like, commento)
│   ├── 7.2 Badge non letti su BottomNav e header
│   ├── 7.3 Firebase Cloud Messaging (push)
│   ├── 7.4 Cloud Functions: sendPushOnNotification
│   └── 7.5 Primo deploy Firebase Hosting
├── 8. UI/UX avanzata
│   ├── 8.1 Tema chiaro warm sand (#f0ede8)
│   ├── 8.2 Rilevamento system preference (prefers-color-scheme)
│   ├── 8.3 Toggle manuale tema con localStorage
│   ├── 8.4 Toast notifications (successo, errore, info)
│   └── 8.5 Animazioni stagger, transizioni pagina, layout responsive
├── 9. Feature avanzate
│   ├── 9.1 Reel view scroll-snap verticale (/reel)
│   ├── 9.2 Algoritmo "Per te" con scoring
│   ├── 9.3 Profili privati e approvazione follow
│   ├── 9.4 Accept/Reject richieste follow in Notifiche
│   └── 9.5 Badge ✓ votato sulle card del feed
├── 10. Moderazione e sicurezza
│   ├── 10.1 Cloud Functions: moderatePoll, moderateComment, moderateReply
│   ├── 10.2 Blocklist ~55 termini IT/EN
│   ├── 10.3 Sistema violazioni (3 infrazioni → userMode: limited)
│   ├── 10.4 Toast feedback moderazione con onSnapshot
│   └── 10.5 Modalità utente: limited / normal / premium + auto-upgrade 24h
├── 11. Business e monetizzazione
│   ├── 11.1 Pagina /advertise inserzionisti
│   └── 11.2 Pacchetti Starter (€299) / Growth (€799) / Enterprise
└── 12. Completamento
    ├── 12.1 Media kit PDF scaricabile da /advertise
    ├── 12.2 Dominio personalizzato qpe.app su Firebase Hosting
    ├── 12.3 Definizione modalità normal e premium (limiti e vantaggi)
    └── 12.4 Onboarding nuovi utenti (selezione categorie al primo accesso)
```
