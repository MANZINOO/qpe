Project Management — QPé
========================
[TOC]

v1.0.0 - 07/04/2026

---

# Obiettivi di Progetto

Gli obiettivi di progetto definiscono i risultati specifici che QPé mira a raggiungere. A differenza degli obiettivi di continuità (gestiti dall'imprenditore), gli obiettivi di progetto sono **unici, temporanei e misurabili**.

## Obiettivi SMART di QPé

| Obiettivo | S | M | A | R | T |
|---|---|---|---|---|---|
| Rilasciare una versione beta funzionante | Sì | v0.4.0 | Sì | Sì | Entro marzo 2026 |
| Implementare GDPR completo | Sì | Cookie banner + export + delete | Sì | Sì | Entro aprile 2026 |
| Raggiungere 100 utenti registrati | Sì | 100 account su Firebase | Sì | Sì | Entro giugno 2026 |
| Ottenere il primo cliente sponsorizzato | Sì | 1 sondaggio sponsorizzato | Sì | Sì | Entro settembre 2026 |

**SMART** = **S**pecifico, **M**isurabile, **A**chievable (raggiungibile), **R**ilevante, **T**ime-bound (con scadenza)

## Tre dimensioni degli obiettivi

```
         Qualità
            ▲
            │
            │         ⬟ Zona di
            │           successo
            │
            └──────────────────► Tempo
           /
          /
         ▼
       Costi
```

- **Qualità** — app funzionante, sicura, conforme GDPR, responsive
- **Tempo** — rispetto delle milestone scolastiche del corso GPOI 2025/2026
- **Costi** — sviluppo con Firebase free tier; costi < 5 EUR/mese durante la fase beta

---

# Struttura Organizzativa

Il progetto QPé adotta una struttura **Task Force**: un team autonomo e dedicato con un unico project manager responsabile del risultato.

## Team QPé

| Ruolo | Responsabilità |
|---|---|
| **Project Manager** | Pianificazione, scadenze, coordinamento, comunicazione con il docente |
| **Lead Developer** | Architettura React/Firebase, codice principale, code review |
| **Frontend Developer** | UI/UX, CSS, componenti, responsive design |
| **Documentazione** | README, CHANGELOG, docs/, GDPR compliance |

> Nel contesto scolastico i ruoli possono sovrapporsi e ogni membro può coprire più funzioni.

## Confronto strutture organizzative

| Struttura | Vantaggi | Svantaggi | Adatta a QPé? |
|---|---|---|---|
| **Funzionale** | Usa risorse esistenti | Frammentazione, ritardi | No (team piccolo) |
| **Task Force** | Focus, autonomia, velocità | Risorse dedicate | **Sì** ✓ |
| **A Matrice** | Equilibrio risorse/risultato | Complessità gestionale | No (struttura troppo complessa) |

---

# Fasi del Progetto

## Fase 1 — Avvio (Settembre–Ottobre 2025)

- Brainstorming idea progetto
- Definizione del concept QPé
- Studio di fattibilità tecnica ed economica
- Setup repository GitHub
- Definizione requisiti funzionali (RF01–RF08) e non funzionali (RNF01–RNF08)

## Fase 2 — Pianificazione (Novembre 2025)

- Struttura documentazione `docs/`
- Break even point e analisi finanziaria
- Configurazione Firebase (Auth, Firestore, Storage)
- Setup Vite + React + React Router

## Fase 3 — Esecuzione (Dicembre 2025 – Marzo 2026)

- v0.1.0: Cookie banner GDPR, Privacy Policy, autenticazione
- v0.4.0: Sondaggi, voto, like, commenti, follow, notifiche, DM, ricerca

## Fase 4 — Chiusura e Consegna (Aprile 2026)

- v0.5.0: Tema chiaro, bug fix, ottimizzazioni UI/UX
- Documentazione completa (`docs/`)
- Verifica sicurezza (nessun dato sensibile su GitHub)
- Presentazione finale

---

# Gestione dei Rischi

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| Firebase quota superata | Bassa | Alto | Monitoraggio uso, alerting Firebase |
| API key esposta su GitHub | Bassa | Critico | `.env` in `.gitignore`, `.env.example` |
| Violazione GDPR | Bassa | Critico | Cookie banner, privacy policy, export/delete |
| Bug critico prima della consegna | Media | Alto | Test manuali, fix rapido con hotfix branch |
| Dipendenze outdated | Media | Basso | `npm audit` regolare |

---

# Comunicazione

| Canale | Utilizzo |
|---|---|
| **GitHub Issues** | Bug, feature request, task |
| **GitHub Projects** | Kanban board stato attività |
| **CHANGELOG.md** | Cronologia versioni per docente/reviewer |
| **Commit messages** | Traccia ogni modifica al codice |
| **README.md** | Documentazione principale per tutti |

---

# KPI — Indicatori di Performance

| KPI | Target | Come misurarlo |
|---|---|---|
| Funzionalità completate | 100% dei requisiti funzionali (RF01–RF08) | Checklist in TODO.md |
| Bug critici aperti | 0 al momento della consegna | GitHub Issues |
| Copertura GDPR | Cookie banner + export + delete | Verifica manuale |
| Performance pagina | < 2s caricamento iniziale | Lighthouse Chrome DevTools |
| Versione rilasciata | ≥ v0.4.0 stabile | CHANGELOG.md |
