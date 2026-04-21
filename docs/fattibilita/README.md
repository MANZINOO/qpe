# Studio di Fattibilità — QPé
[TOC]

v1.0.0 - 28/03/2026 - Studente GPOI

<br>

# Sommario Esecutivo

### Descrizione sintetica del progetto
QPé è un'applicazione web social per sondaggi binari in formato coupé, sviluppata con React 19 e Firebase. Gli utenti creano sondaggi a due opzioni, votano e interagiscono tramite commenti, like, reel e messaggi diretti.

### Scopo principale dello studio
Valutare la fattibilità tecnica, economica e organizzativa dello sviluppo e del lancio commerciale di QPé sul mercato italiano, con possibilità di espansione.

### Raccomandazione finale
**FATTIBILE** — Il progetto presenta un investimento iniziale contenuto (€ 1.100), tecnologie mature e open-source, un mercato in crescita (micro-content social) e un modello di ricavi diversificato (advertising + abbonamenti premium). Il payback è previsto in circa 2 anni e 3 mesi.

### Investimento stimato
€ 900 – € 1.200 (sviluppo 51h + infrastruttura Firebase + dominio + marketing lancio)

### ROI atteso
257% su 3 anni (guadagno netto cumulativo: +€ 2.825 in 3 anni su investimento di € 1.100)

### Rischi principali
- Bassa adozione iniziale utenti (mercato competitivo, network effect lento)
- Dipendenza da Firebase / Google (vendor lock-in)
- Costi infrastruttura scalabili con la crescita degli utenti
- Concorrenza indiretta di piattaforme generaliste (Instagram Polls, X)
- Dipendenza da un singolo sviluppatore per manutenzione e roadmap

<br>

# 1. Introduzione

### Scopo del documento
Questo studio di fattibilità analizza la viabilità del progetto QPé sotto i profili tecnico, economico, di mercato e organizzativo. L'obiettivo è determinare se il progetto è conveniente da avviare e sostenere nel tempo, sulla base di dati quantitativi (Gantt, analisi economica) e qualitativi (analisi di mercato, rischi).

### Contesto del progetto
Il mercato dei social network è dominato da piattaforme generaliste (Instagram, TikTok, X). Esiste tuttavia uno spazio per prodotti verticali focalizzati su engagement specifico. QPé si posiziona nella nicchia dei sondaggi interattivi, formato già popolare come feature secondaria (Instagram Stories, Twitter Polls) ma mai diventato prodotto principale con una community dedicata.

### Stakeholder coinvolti
- **Sviluppatore / Fondatore**: sviluppo, manutenzione, roadmap prodotto
- **Utenti finali**: giovani 16–35 anni, content creator, appassionati di trend e opinion
- **Inserzionisti**: PMI e agenzie che cercano micro-targeting su community giovani e attive
- **Firebase / Google**: fornitore infrastruttura cloud (BaaS)

### Attività Economica
QPé è un'impresa digitale di tipo **platform business** (modello a due lati): connette utenti (lato domanda di contenuto sociale) e inserzionisti (lato domanda di visibilità). Il modello economico è **freemium + advertising**: accesso gratuito agli utenti con monetizzazione tramite pacchetti pubblicitari e abbonamenti premium a pagamento.

<br>

# 2. Descrizione del Progetto

## 2.1 Obiettivi del Progetto

### Obiettivi del progetto
- Creare una piattaforma social mobile-first per sondaggi binari interattivi e anti-bias
- Raggiungere 1.000 utenti registrati entro 6 mesi dal lancio pubblico
- Generare i primi ricavi pubblicitari entro 3 mesi dal lancio
- Sviluppare un prodotto tecnicamente solido, scalabile e conforme GDPR

### Obiettivi secondari
- Costruire una community di content creator attivi e fidelizzati
- Implementare un sistema di moderazione automatica efficace (>95% accuratezza)
- Testare il modello premium con funzionalità differenziate
- Documentare il progetto come caso studio didattico GPOI completo

### KPI di successo
- Utenti registrati: 500 entro 3 mesi → 1.000 entro 6 mesi → 5.000 entro 12 mesi
- Sondaggi creati: 50/giorno (3 mesi) → 200/giorno (12 mesi)
- Retention a 7 giorni: > 30%
- Contratti pubblicitari attivi: 3 (6 mesi) → 10 (12 mesi)
- Contenuti moderati automaticamente: > 95% senza intervento manuale

<br>

## 2.2 Caratteristiche Principali

### Funzionalità chiave
- Creazione sondaggi binari con preview live, color picker (8 preset) e hashtag (max 5)
- Pagina voto coupé a schermo intero con risultati nascosti fino al voto (zero bias)
- Reel verticale scroll-snap (stile TikTok) con votazione inline
- Feed algoritmico "Per te" con scoring per categoria, engagement e recency
- Profili pubblici e privati con follow, like, commenti, risposte annidate
- Messaggi diretti one-to-one in real-time con inoltro sondaggi
- Bot di moderazione automatica (Cloud Functions v2, blocklist 55+ termini IT/EN)
- Sistema userMode: limited / normal / premium con auto-upgrade dopo 24h
- Notifiche push (Firebase Cloud Messaging) e notifiche in-app real-time
- Conformità GDPR completa: export dati, eliminazione account, cookie banner 3 livelli

<br>

## 2.3 Requisiti Fondamentali

### Tecnici
- Browser moderno (Chrome 90+, Safari 14+, Firefox 88+) con supporto PWA
- Firebase Blaze Plan (pay-as-you-go) attivo per Cloud Functions v2
- Node.js 20+ per sviluppo locale e deploy Cloud Functions
- Connessione internet stabile per tutte le funzionalità real-time

### Operativi
- 1 sviluppatore full-stack per sviluppo e manutenzione (3h/settimana post-lancio per aggiornamenti)
- Accesso Firebase Console per moderazione manuale, analytics e gestione utenti
- Processo di onboarding inserzionisti tramite form di contatto su /advertise

### Normativi
- Conformità GDPR (Reg. UE 2016/679): cookie banner, privacy policy, export/eliminazione dati
- Termini di servizio per contenuti generati dagli utenti (UGC)
- Età minima 16 anni per la registrazione (GDPR Art. 8)
- D.Lgs. 70/2003 (commercio elettronico) e normativa italiana su piattaforme digitali

<br>

# 3. Analisi di Mercato

## 3.1 Analisi della Domanda

### Clienti di riferimento
**Utenti**: Giovani 16–35 anni, nativi digitali, utenti attivi di Instagram e TikTok. Cercano forme di espressione rapida, interazione sociale leggera e contenuti brevi. Creator che vogliono capire le preferenze del proprio pubblico in modo immediato.

**Inserzionisti**: PMI italiane (e-commerce, food, fashion, lifestyle), agenzie di comunicazione digitale e brand locali che vogliono engagement qualificato su target giovane con budget contenuto.

### Dimensione del mercato
- Utenti social network attivi in Italia (2025): ~42 milioni (fonte: We Are Social / ISTAT)
- Segmento target primario (16–35 anni attivi sui social): ~12 milioni
- Mercato advertising social media in Italia: ~€ 1,5 miliardi/anno (crescita +12% YoY)
- Segmento micro-influencer e app di nicchia: in forte crescita (+25% YoY)

### Tendenze di mercato
- Crescita del formato breve e interattivo (TikTok, Reels, Stories con sondaggi)
- Aumento della domanda di engagement autentico rispetto alla semplice reach passiva
- Crescente attenzione alla privacy → opportunità per piattaforme GDPR-native by design
- Frammentazione social: gli utenti usano mediamente 6,7 piattaforme (GWI 2024)

<br>

## 3.2 Analisi della Concorrenza

| Concorrente | Punti di Forza | Punti di Debolezza | Quota di Mercato |
|-------------|----------------|---------------------|------------------|
| Instagram Polls | Base utenti enorme, integrazione Stories | Feature secondaria, nessuna community dedicata | Dominante |
| Twitter/X Polls | Ampia diffusione, discussioni pubbliche | Piattaforma generalista, tossicità elevata | In calo |
| StrawPoll.com | Sondaggi multipli, no account richiesto | UI datata, nessun social layer | Niche |
| Mentimeter | Ottimo per eventi live e presentazioni | A pagamento, orientato B2B, non social | B2B focused |
| **QPé** | **Social dedicato, mobile-first, GDPR, reel, anti-bias** | **Nuova, base utenti da costruire** | **In lancio** |

<br>

## 3.3 Analisi SWOT

| **Forze (Strengths)** | **Debolezze (Weaknesses)** |
|----------------------|---------------------------|
| Investimento iniziale basso (€ 1.100) | Brand sconosciuto al lancio |
| Tech stack moderno, scalabile e serverless | Dipendenza da un solo sviluppatore |
| GDPR-native by design | Nessuna app nativa (solo web/PWA) |
| Moderazione automatica integrata | Budget marketing limitato |
| Risultati anti-bias (nascosti pre-voto) | Network effect lento nelle fasi iniziali |
| **Opportunità (Opportunities)** | **Minacce (Threats)** |
| Mercato micro-content in forte crescita | Competitors con risorse enormi (Meta, Google) |
| Advertising locale poco presidiato da competitor | Cambi di policy Google/Firebase |
| Partnership con creator, scuole e università | Nuovi entranti con concept simile |
| Espansione funzionalità premium (v1.0+) | Saturazione del mercato social media |

<br>

## 3.4 Valore per il Cliente

### Proposta di Valore Unica (UVP)
QPé è l'unica piattaforma social dedicata esclusivamente ai sondaggi binari: un formato semplice, immediato e anti-bias (risultati nascosti fino al momento del voto) che massimizza l'engagement autentico senza influenzare la scelta dell'utente.

### Benefici per i clienti
- **Utenti**: espressione immediata, scoperta di opinioni, community su interessi specifici tramite hashtag
- **Creator**: feedback del pubblico in tempo reale, statistiche dettagliate (votanti, liker), follower qualificati
- **Inserzionisti**: audience giovane e attiva, formati pubblicitari integrati nel feed, metriche di engagement reale con 3 pacchetti (Starter € 299 / Growth € 799 / Enterprise custom)

<br>

# 4. Analisi Tecnica

## 4.1 Soluzione Tecnica Proposta
Applicazione web progressiva (PWA) sviluppata con React 19 + Vite (frontend) e Firebase (backend as a service). L'architettura serverless elimina la necessità di server dedicati, riducendo costi fissi e complessità operativa. La moderazione automatica è gestita da Cloud Functions v2 (Node.js 20) con trigger su creazione documento Firestore.

<br>

## 4.2 Requisiti Tecnici

### Infrastruttura
- Firebase Hosting (CDN globale, HTTPS automatico, deploy in <2 minuti)
- Firestore (database NoSQL real-time, regole di sicurezza granulari per collezione)
- Firebase Storage (avatar utenti, compressi client-side a 400×400px JPEG 82%)
- Cloud Functions v2 Node.js 20 (moderazione automatica + notifiche push)
- Firebase Cloud Messaging (FCM) per notifiche push su dispositivi mobile e desktop

### Software
- React 19 + Vite 6 (frontend)
- Firebase SDK 11 (autenticazione, database, storage, functions, messaging)
- Node.js 20 (Cloud Functions)
- Git + GitHub (version control, CI/CD, documentazione)

### Hardware
- Sviluppo: PC con 8GB RAM, Node.js installato, browser moderno
- Produzione: infrastruttura Firebase completamente gestita (zero hardware proprietario)

### Sicurezza
- Firebase Authentication: email/password + Google OAuth
- Chiavi API Firebase in variabili d'ambiente Vite (`.env`, mai nel codice sorgente)
- Regole Firestore granulari per ogni collezione (utenti, sondaggi, commenti, DM, notifiche)
- Bot di moderazione con blocklist ~55 termini IT/EN, sistema violazioni (3 infrazioni → userMode: limited)
- GDPR: consenso esplicito cookie banner, privacy policy, export dati JSON (Art. 20), eliminazione account (Art. 17)

### Scalabilità
- Firestore scala automaticamente fino a milioni di documenti senza configurazione
- Cloud Functions scala da 0 a 1.000 istanze parallele secondo il traffico
- Firebase Hosting con CDN globale: latenza < 100ms in Europa

### Manutenzione
- 3 ore/settimana per aggiornamenti dipendenze, monitoring, nuove funzionalità
- Firebase Console per monitoring real-time: errori, performance, analytics, Crashlytics
- CHANGELOG con semantic versioning (Keep a Changelog) per tracciare ogni rilascio

<br>

## 4.3 Fattibilità Tecnica

### Tecnologie disponibili
Tutte le tecnologie sono mature, ampiamente documentate e stabili: React (Meta, dal 2013), Firebase (Google, dal 2014), Vite (Evan You, open-source). Nessuna dipendenza sperimentale critica.

### Competenze del team
Lo sviluppatore dispone di competenze full-stack complete: React, JavaScript ES2024, Firebase (Firestore, Auth, Storage, Functions, FCM), CSS3/CSS Variables, Git/GitHub, Node.js, GDPR compliance.

### Fornitori e partner
- **Google Firebase**: infrastruttura cloud BaaS (hosting, database, auth, storage, functions)
- **GitHub**: hosting codice sorgente, issue tracking, CI/CD
- **npm / Vite**: toolchain di build e gestione dipendenze

### Rischi tecnici
- Vendor lock-in Firebase: migrazione a infrastruttura alternativa è complessa e costosa
- Cold start Cloud Functions: latenza 1–3s sulla prima invocazione dopo inattività
- Limiti query Firestore: nessun full-text search nativo (soluzione attuale: prefix matching)
- React 19 recente: possibili breaking changes nelle librerie di terze parti nei prossimi mesi

### Prototipi e test
- Versione v0.6.0 completamente funzionante e deployata su Firebase Hosting
- Testata su Chrome, Safari, Firefox (mobile e desktop)
- Funzionalità validate: voto, commenti, reel, moderazione automatica, DM, notifiche push, GDPR

<br>

# 5. Analisi Economica Finanziaria

## 5.1 Stima dei Costi

| Categoria | Investimento Iniziale | Costi annuali (€) |
|---|---|---|
| **Personale** (sviluppo 51h × 15 €/h — da Gantt) | € 765 | € 780 (manutenzione 1h/sett) |
| **Hardware** | € 0 (infrastruttura cloud) | € 0 |
| **Software / Firebase** (Blaze plan) | € 120 (3 mesi setup) | € 480 |
| **Dominio** (qpe.app) | € 15 | € 15 |
| **Marketing lancio** | € 200 | € 300 |
| **Totale** | **€ 1.100** | **€ 1.575** |

<br>

## 5.2 Stima dei Ricavi

| Fonte di Ricavo | Descrizione | Anno 1 (€) | Anno 2 (€) | Anno 3 (€) |
|---|---|---|---|---|
| **Pubblicità Starter** | Pacchetto € 299 — banner + feed sponsorizzato | € 598 | € 1.495 | € 2.990 |
| **Pubblicità Growth** | Pacchetto € 799 — campagna completa 30gg | € 0 | € 799 | € 2.397 |
| **Pubblicità Enterprise** | Campagna custom — preventivo dedicato | € 0 | € 0 | € 1.500 |
| **Abbonamenti Premium** | € 4,99/mese per funzionalità avanzate | € 0 | € 1.188 | € 2.988 |
| **Altri ricavi** | Sponsorizzazioni, partnership creator | € 202 | € 18 | € 125 |
| **Totale** | | **€ 800** | **€ 3.500** | **€ 10.000** |

Proiezione conservativa: 2 campagne Starter nel primo anno, crescita organica dalla base utenti. Break-even operativo atteso nel corso dell'Anno 2.

<br>

## 5.3 Indicatori di Redditività

### ROI (Return on Investment)
**257%** su orizzonte 3 anni
Calcolo: (Guadagno netto € 2.825 / Investimento iniziale € 1.100) × 100
*(Vedi file ROI_Payback_VAL_TIR.md per il calcolo dettagliato)*

### Payback Period
**2 anni e 3 mesi**
Il flusso cumulativo torna positivo nel corso dell'Anno 3 (mancavano € 1.075 a fine Anno 2, coperti in ~3,3 mesi di Anno 3)

### VAL/NPV (Valore Attuale Netto) — tasso di sconto 10%
**+ € 1.787**
VAN > 0: il progetto crea valore anche considerando il costo opportunità del capitale

### TIR/IRR (Tasso Interno di Rendimento)
**≈ 46%**
TIR >> 10% (costo del capitale): rendimento molto superiore alla soglia minima

<br>

## 5.4 Break-even Analysis

### Punto di Pareggio
Il progetto raggiunge il break-even operativo (ricavi = costi operativi annuali di € 1.575) nel corso dell'Anno 2, quando i ricavi (€ 3.500) superano ampiamente i costi operativi. Il pareggio sull'investimento totale avviene invece all'inizio dell'Anno 3.

### Volume di Vendite Necessario
Per coprire i costi operativi annuali (€ 1.575/anno):
- Solo pacchetti **Starter** (€ 299): ~6 campagne/anno
- Solo pacchetti **Growth** (€ 799): ~2 campagne/anno
- **Mix minimo**: 3 Starter + 1 Growth = € 1.696 (break-even superato)

Per recuperare l'investimento iniziale (€ 1.100) al termine dell'Anno 2 sono necessari ricavi aggiuntivi di ~€ 550 rispetto ai costi, equivalenti a circa 2 pacchetti Starter extra.

<br>

# 6. Analisi Organizzativa

## 6.1 Struttura Interna

### Ruoli e Responsabilità
- **Sviluppatore / Fondatore**: sviluppo frontend e backend, deploy, manutenzione, moderazione manuale, customer service inserzionisti, gestione dominio e infrastruttura Firebase

### Nuove figure professionali
- **Anno 2**: Social Media Manager (freelance, part-time) per crescita organica della community e gestione canali social QPé
- **Anno 3**: Sales Account (part-time) per gestione contratti inserzionisti Enterprise e partnership creator

### Formazione
- Aggiornamento continuo su Firebase releases e React ecosystem: ~2h/settimana
- Normativa GDPR e aggiornamenti ePrivacy: revisione annuale

<br>

## 6.2 Struttura di Project Management

### Responsabile di Progetto
Studente sviluppatore — responsabile unico di sviluppo, deploy, manutenzione, business development e documentazione GPOI.

### Team di Progetto
- **A — Sviluppatore principale**: frontend React, backend Firebase, Cloud Functions, deploy
- **B — Firebase / Cloud**: infrastruttura cloud, moderazione automatica (fornitore Google)
- **C — Design / UX**: UI design, tema visivo dark/chiaro, layout responsive
- **D — Documentazione**: README, CHANGELOG, Gantt, studio di fattibilità, requisiti

### Metodologia di Gestione
**Agile / iterativo**: sviluppo per versioni semantiche (v0.1.0 → v0.6.0), sprint settimanali, rilasci frequenti documentati nel CHANGELOG. GitHub per version control e tracciamento attività.

### Strumenti di Gestione
- **GitHub**: repository codice, issue tracking, versioning, pull request
- **Firebase Console**: monitoring real-time, analytics, deploy, gestione utenti
- **TODO.md / CHANGELOG.md**: pianificazione backlog e storico rilasci
- **Gantt (gantt_qpe.xlsx)**: pianificazione temporale fasi, task, ore e costi

<br>

# 7. Analisi dei Rischi

## 7.1 Identificazione dei Rischi

| Rischio | Descrizione | Probabilità (1-5) | Impatto (1-5) | Mitigazione |
|---------|-------------|:-----------------:|:-------------:|-------------|
| Bassa adozione utenti | Difficoltà a raggiungere massa critica per il network effect | 4 | 5 | Marketing mirato, partnership creator, onboarding ottimizzato |
| Vendor lock-in Firebase | Google potrebbe modificare prezzi o deprecare servizi | 2 | 4 | Architettura astratta, monitoraggio mensile costi Firebase |
| Costi infrastruttura | Picchi di traffico possono far aumentare i costi Firebase | 3 | 3 | Limiti di spesa Firebase Console, ottimizzazione query Firestore |
| Concorrenza big tech | Meta/TikTok potrebbero lanciare feature di sondaggi dedicate | 3 | 4 | Differenziazione su community dedicata, anti-bias, privacy |
| Violazioni GDPR | Sanzioni per non conformità normativa europea | 1 | 5 | Privacy by design, cookie banner 3 livelli, export/eliminazione dati |
| Contenuti inappropriati | Abuso della piattaforma nonostante moderazione | 3 | 3 | Bot moderazione v2, sistema violazioni, segnalazioni manuali |
| Dipendenza sviluppatore | Blocco operativo in caso di indisponibilità | 3 | 4 | Documentazione completa, codice commentato, README sviluppatori |

<br>

# 8. Piano di Implementazione

## 8.1 Fasi del Progetto

1. **Fase 1 — Avvio e documentazione** (28-Mar → 20-Apr): Studio di fattibilità, requisiti RF/RNF, analisi economica, piano PM, setup repository GitHub
2. **Fase 2 — Infrastruttura base** (28-Mar → 5-Apr): React + Vite + Firebase, Auth email/Google, Firestore, variabili d'ambiente, regole sicurezza base
3. **Fase 3 — GDPR e Privacy** (30-Mar → 5-Apr): Cookie Banner 3 livelli, Privacy Policy, Cookie Policy, export dati, eliminazione account
4. **Fase 4 — Funzionalità core sondaggi** (6-Apr → 14-Apr): Crea sondaggio, voto coupé, risultati, annullamento, like, commenti, statistiche autore
5. **Fase 5 — Feed e navigazione** (28-Mar → 5-Apr): Home feed Firestore, tab Per te/Seguiti/Tendenze, filtri hashtag, cache, skeleton loading, BottomNav
6. **Fase 6 — Profilo e sociale** (28-Mar → 5-Apr): Profilo, avatar, follow/unfollow, profili pubblici, ricerca, messaggi diretti DM
7. **Fase 7 — Notifiche e push** (28-Mar → 5-Apr): Notifiche real-time, badge non letti, FCM push, Cloud Functions, deploy Firebase Hosting
8. **Fase 8 — UI/UX avanzata** (30-Mar → 5-Apr): Tema chiaro warm sand, system preference, toggle localStorage, toast, animazioni, responsive
9. **Fase 9 — Feature avanzate** (30-Mar → 5-Apr): Reel scroll-snap, algoritmo "Per te", profili privati, accept/reject follow, badge votato
10. **Fase 10 — Moderazione e sicurezza** (30-Mar → 30-Apr, 60%): Bot moderazione, blocklist 55+ termini, sistema violazioni, userMode limited/normal/premium
11. **Fase 11 — Business e monetizzazione** (5-Apr → 30-Apr, 10%): Pagina /advertise, pacchetti Starter/Growth/Enterprise
12. **Fase 12 — Completamento** (15-Apr → 30-Apr, da pianificare): Media kit PDF, dominio qpe.app, modalità premium, onboarding nuovi utenti

<br>

## 8.2 Tempistiche

### Durata Totale del Progetto
- **MVP funzionante**: 17 settimane · 51 ore di sviluppo (28/03 → 14/04/2026)
- **Completamento previsto**: 30/04/2026 (Fase 10 e 11)
- **Lancio commerciale v1.0**: previsto entro 10/05/2026 (dominio + produzione)

### Milestone Principali
- ✅ **v0.1.0** (29/03): Auth + GDPR funzionanti — repository configurato
- ✅ **v0.4.0** (31/03): Feature core complete (sondaggi, feed, profili, DM, notifiche)
- ✅ **v0.5.0** (07/04): UI/UX completa (temi, reel, responsiveness)
- ✅ **v0.6.0** (14/04): Moderazione automatica + userMode + /advertise
- 🔄 **v0.7.0** (30/04): Onboarding + media kit + definizione premium
- 📋 **v1.0.0** (01/06): Lancio pubblico + dominio qpe.app

*Gantt completo disponibile in allegato: docs/gantt_qpe.xlsx (17 settimane · 51 ore · € 765 di sviluppo diretto)*

<br>

# 9. Conclusioni e Raccomandazioni

## 9.1 Sintesi della Valutazione

**Vantaggi principali:**
- Investimento iniziale molto contenuto (€ 1.100 totale, di cui € 765 sviluppo da Gantt)
- Prodotto tecnicamente funzionante e testato alla versione v0.6.0
- Tecnologia serverless: costi fissi quasi nulli, scala automaticamente
- Mercato micro-content in crescita, proposta di valore differenziata (anti-bias, dedicato)
- Conformità GDPR integrata nativamente nel design
- Tutti gli indicatori finanziari positivi: ROI 257%, VAN +€ 1.787, TIR 46%

**Svantaggi / Sfide:**
- Network effect difficile: il valore della piattaforma cresce con gli utenti, ma all'inizio è scarso
- Budget marketing limitato → crescita organica lenta nel primo anno
- Dipendenza operativa da un singolo sviluppatore
- Anno 1 con flusso di cassa netto negativo (-€ 775) per i bassi ricavi iniziali
- Vendor lock-in Firebase difficile da eliminare a breve termine

<br>

## 9.2 Raccomandazione Finale

**✅ FATTIBILE**

QPé è finanziariamente e tecnicamente fattibile. L'investimento iniziale è minimo (€ 1.100), la tecnologia è solida e scalabile, il modello di ricavi è realistico nel medio termine e tutti gli indicatori di redditività sono positivi. Il principale rischio rimane la crescita della base utenti, affrontabile con una strategia di marketing mirata (partnership creator locali, presenza su social, onboarding ottimizzato).

Si raccomanda di procedere con il completamento della Fase 10 (moderazione) e Fase 11 (business), per poi lanciare la versione pubblica v1.0.0 entro maggio 2026, concentrando le risorse iniziali sull'acquisizione dei primi 500 utenti e dei primi 3 contratti pubblicitari.

<br>

# X. Allegati (cartella docs/fattibilita/allegati/)
- `gantt_qpe.xlsx` — Diagramma di Gantt: 12 fasi, 51 ore, € 765 sviluppo, 17 settimane totali
- `ROI_Payback_VAL_TIR.md` — Calcolo dettagliato ROI (257%), Payback (2a 3m), VAN (+€ 1.787), TIR (46%)
- `firestore_rules.txt` — Regole di sicurezza Firestore complete per tutte le collezioni
- `privacy_policy.md` — Privacy Policy completa (GDPR Art. 13-14)
- `cookie_policy.md` — Cookie Policy e gestione consensi (3 livelli: necessari / analytics / marketing)
