Gantt — QPé
===========

v1.3.0 - 07/04/2026

Pianificazione temporale del progetto QPé.

> Il Gantt è disponibile anche in formato Excel nella stessa cartella: `template_gantt.xlsx`

---

# Gantt del Progetto

```mermaid
gantt
    title QPé — Piano di Progetto 2026
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Documentazione
    Studio di fattibilità          :done,    doc1,  2026-03-31, 2026-04-05
    Requisiti funzionali (RF)      :done,    doc2,  2026-03-31, 2026-04-03
    Requisiti non funzionali (RNF) :done,    doc3,  2026-03-31, 2026-04-03
    Break Even Point               :done,    doc4,  2026-04-03, 2026-04-05
    ROI / Payback / VAN / TIR      :done,    doc5,  2026-04-04, 2026-04-06
    Project Management             :done,    doc6,  2026-04-04, 2026-04-06
    GDPR & Cookie Policy           :done,    doc7,  2026-03-31, 2026-04-02
    README manuale utente          :done,    doc8,  2026-04-05, 2026-04-07
    Gantt (md + Excel)             :done,    doc9,  2026-04-06, 2026-04-07
    CHANGELOG + TODO               :done,    doc10, 2026-03-31, 2026-04-07

    section Infrastruttura
    Setup repository GitHub        :done,    inf1,  2026-03-31, 2026-03-31
    Configurazione Firebase        :done,    inf2,  2026-03-31, 2026-04-01
    Variabili d'ambiente (.env)    :done,    inf3,  2026-03-31, 2026-04-01
    Regole Firestore               :done,    inf4,  2026-03-31, 2026-04-07
    Firebase Storage (avatar)      :done,    inf5,  2026-03-31, 2026-04-01

    section v0.1.0 — Base
    Autenticazione email/password  :done,    v01a,  2026-03-31, 2026-04-01
    Google OAuth                   :done,    v01b,  2026-03-31, 2026-04-01
    Profilo utente Firestore       :done,    v01c,  2026-03-31, 2026-04-01
    Cookie Banner GDPR             :done,    v01d,  2026-03-31, 2026-04-01
    Privacy Policy & Cookie Policy :done,    v01e,  2026-03-31, 2026-04-01

    section v0.4.0 — Feature principali
    Home feed & tab                :done,    v04a,  2026-03-31, 2026-04-01
    Creazione sondaggio (coupé)    :done,    v04b,  2026-03-31, 2026-04-01
    Sistema voto & risultati       :done,    v04c,  2026-03-31, 2026-04-01
    Like, commenti, risposte       :done,    v04d,  2026-04-01, 2026-04-02
    Follow & Notifiche             :done,    v04e,  2026-04-01, 2026-04-02
    Messaggi diretti (DM)          :done,    v04f,  2026-04-01, 2026-04-02
    Upload avatar & profilo pub.   :done,    v04g,  2026-03-31, 2026-04-01
    Ricerca utenti & hashtag       :done,    v04h,  2026-04-01, 2026-04-02

    section v0.5.0 — Ottimizzazioni
    Tema chiaro (warm sand)        :done,    v05a,  2026-04-02, 2026-04-05
    Inoltro sondaggio & visualizz. :done,    v05b,  2026-04-02, 2026-04-05
    Preferenze notifiche & privacy :done,    v05c,  2026-04-03, 2026-04-06
    Bug fix (Home, Settings)       :done,    v05d,  2026-04-05, 2026-04-07
    Documentazione completa        :done,    v05e,  2026-04-05, 2026-04-07

    section Futuri sviluppi
    Swipe verticale (reel)         :         fut1,  2026-04-08, 2026-05-01
    Infinite scroll / paginazione  :         fut2,  2026-04-10, 2026-04-30
    Notifiche push (FCM)           :         fut3,  2026-04-15, 2026-05-15
    Pagina /advertise (media kit)  :         fut4,  2026-04-20, 2026-05-10
    Deploy su dominio qpe.app      :         fut5,  2026-05-01, 2026-05-20
    Presentazione GPOI             :         fut6,  2026-05-15, 2026-05-20
```

---

# Milestone principali

| Milestone | Data | Versione |
|---|---|---|
| Init repository | 31 Marzo 2026 | v0.0.1 |
| Prima versione funzionante (auth + GDPR) | 31 Marzo 2026 | v0.1.0 |
| Release completa con tutte le feature social | 1 Aprile 2026 | v0.4.0 |
| Ottimizzazioni, bug fix e docs finali | 7 Aprile 2026 | v0.5.0 |
| Deploy su dominio personalizzato | Maggio 2026 (previsto) | v1.0.0 |

---

# WBS — Work Breakdown Structure

```
QPé
├── 1. Documentazione
│   ├── 1.1 Studio di fattibilità
│   ├── 1.2 Requisiti (RF + RNF)
│   ├── 1.3 Analisi economica (BEP, ROI, VAN, TIR)
│   ├── 1.4 Project management
│   ├── 1.5 GDPR & cookie
│   └── 1.6 README manuale utente
├── 2. Infrastruttura
│   ├── 2.1 Setup GitHub
│   ├── 2.2 Firebase (Auth, Firestore, Storage)
│   └── 2.3 Sicurezza (regole Firestore, .env)
├── 3. Sviluppo Frontend
│   ├── 3.1 Autenticazione
│   ├── 3.2 Sondaggi (creazione, voto, risultati)
│   ├── 3.3 Social (follow, notifiche, DM, commenti)
│   ├── 3.4 UI/UX (tema, responsive, animazioni)
│   └── 3.5 GDPR (cookie banner, export, delete)
└── 4. Rilascio
    ├── 4.1 Test manuali
    ├── 4.2 Bug fix
    ├── 4.3 Documentazione finale
    └── 4.4 Deploy
```
