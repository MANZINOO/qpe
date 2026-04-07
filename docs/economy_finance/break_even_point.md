Break Even Point — QPé
======================
[TOC]

v1.1.0 - 07/04/2026

---

# Introduzione

Il **Break Even Point (BEP)**, o punto di pareggio, rappresenta il livello di vendite in cui i ricavi totali eguagliano i costi totali: l'azienda non realizza né profitti né perdite. Per QPé è il numero minimo di clienti (brand/inserzionisti) o di sondaggi sponsorizzati necessari per coprire i costi operativi.

---

# Modello di Business QPé

QPé adotta un modello **B2B freemium**: l'app è gratuita per gli utenti, mentre i ricavi provengono da brand e inserzionisti.

**Fonti di ricavo:**

| Prodotto | Prezzo | Target clienti |
|---|---|---|
| **Sondaggio sponsorizzato** | 50–200 EUR (una tantum) | Piccoli brand, negozi locali |
| **Insight Dashboard** | 99–299 EUR/mese | Brand con bisogno di dati aggregati |
| **Report analisi dati** | 150–500 EUR (una tantum) | Marketing manager, agenzie |

*Prezzo di riferimento per il calcolo BEP: 150 EUR/sondaggio sponsorizzato (scenario base)*

---

# Costi Fissi Mensili (CF)

I costi fissi rimangono costanti indipendentemente dal volume di vendite.

| Voce di Costo | Importo Mensile (EUR) | Note |
|---|---|---|
| Dominio `.app` | 1,00 | ~12 EUR/anno |
| Firebase Blaze (base) | 0 | Free tier sufficiente in fase beta |
| Vercel / Firebase Hosting | 0 | Free tier |
| Strumenti di sviluppo | 0 | VSCode, Git, Vite — tutti gratuiti |
| Marketing base (social, SEO) | 0–20 | Solo organico nella fase iniziale |
| **Totale Costi Fissi** | **~1–21 EUR/mese** | |

> In fase beta con Firebase Spark Plan, i costi fissi sono quasi zero. Con crescita (>50K letture/giorno) si passa al piano Blaze pay-as-you-go.

---

# Costi Variabili per Unità (CVU)

I costi variabili crescono proporzionalmente al numero di sondaggi sponsorizzati gestiti.

| Voce | Costo per sondaggio (EUR) | Note |
|---|---|---|
| Firebase letture/scritture extra | ~0,30 | Stima per sondaggio attivo 30 giorni |
| Banda / Storage aggiuntivo | ~0,10 | Immagini, avatar, dati |
| Supporto cliente (tempo) | ~5,00 | 30 minuti × operatore |
| **Totale CVU** | **~5,40** | |

---

# Prezzi di Vendita (P)

| Piano | Prezzo (EUR) | Incluso |
|---|---|---|
| **Starter** | 50 | 1 sondaggio, 7 giorni, reach base |
| **Standard** | 150 | 1 sondaggio, 30 giorni, statistiche base |
| **Premium** | 300 | 3 sondaggi, 30 giorni, insight dashboard 1 mese |

*Piano di riferimento per il BEP: Standard a 150 EUR*

---

# Calcolo del Break Even Point

## Step 1 — Margine di Contribuzione Unitario (MC)

$$
\text{MC} = P - \text{CVU} = 150 - 5{,}40 = 144{,}60 \text{ EUR}
$$

## Step 2 — BEP in unità (numero di sondaggi sponsorizzati)

$$
\text{BEP (unità)} = \frac{\text{CF}}{\text{MC}} = \frac{21}{144{,}60} \approx 1 \text{ sondaggio/mese}
$$

Con i costi fissi attuali (dominio + marketing base), **basta un sondaggio sponsorizzato al mese** per raggiungere il pareggio.

## Step 3 — BEP in valore monetario (fatturato mensile)

$$
\text{Ratio MC} = \frac{\text{MC}}{P} = \frac{144{,}60}{150} = 96{,}4\%
$$

$$
\text{BEP (valore)} = \frac{21}{0{,}964} \approx 21{,}79 \text{ EUR/mese}
$$

---

# Analisi di Sensibilità

| Scenario | Costi Fissi (EUR) | Prezzo (EUR) | MC (EUR) | BEP (sondaggi/mese) |
|---|---|---|---|---|
| **Minimalista** (solo dominio) | 1 | 50 | 44,60 | 1 |
| **Base** (dominio + marketing) | 21 | 150 | 144,60 | 1 |
| **Crescita** (+ team part-time) | 500 | 150 | 144,60 | 4 |
| **Startup** (+ ufficio/coworking) | 1.500 | 200 | 194,60 | 8 |

---

# Proiezione Primo Anno (post-lancio)

| Trimestre | Utenti Registrati | Sondaggi Sponsorizzati | Insight Dashboard | Ricavi Stimati (EUR) |
|---|---|---|---|---|
| **Q1** (lug–set 2026) | 100–500 | 1–3 | 0 | 150–450 |
| **Q2** (ott–dic 2026) | 500–2.000 | 3–8 | 0–1 | 450–1.500 |
| **Q3** (gen–mar 2027) | 2.000–5.000 | 8–15 | 1–3 | 1.200–3.150 |
| **Q4** (apr–giu 2027) | 5.000–10.000 | 15–30 | 3–5 | 2.250–6.000 |

---

# Piano Operativo per Raggiungere il BEP commerciale

## Fase 1 — Beta pubblica (Aprile–Giugno 2026)
| Elemento | Valore |
|---|---|
| Obiettivo utenti | 200 registrati |
| Obiettivo sondaggi sponsor | 2 |
| Ricavi stimati | 300 EUR |
| Costi fissi | 21 EUR/mese |
| Risultato | **Pareggio raggiunto** |

## Fase 2 — Crescita organica (Luglio–Dicembre 2026)
| Elemento | Valore |
|---|---|
| Obiettivo utenti | 2.000 registrati |
| Sondaggi sponsor | 5–10/mese |
| Insight dashboard | 1–2 clienti attivi |
| Ricavi mensili | 750–1.500 EUR |
| Costi fissi | 21–200 EUR/mese |
| Profitto mensile | ~500–1.300 EUR |

## Fase 3 — Scalabilità (2027)
| Elemento | Valore |
|---|---|
| Obiettivo utenti | 10.000+ |
| Team (part-time) | 1 sviluppatore + 1 sales |
| Costi fissi | ~500–800 EUR/mese |
| Ricavi necessari per BEP | 4–6 sondaggi sponsor + 1 dashboard |

---

# Metriche di Monitoraggio

| Metrica | Target | Frequenza |
|---|---|---|
| **MRR** (Monthly Recurring Revenue) | > 21 EUR (break even) | Mensile |
| **CAC** (Customer Acquisition Cost) | < 20 EUR | Per campagna |
| **LTV** (Lifetime Value cliente B2B) | > 300 EUR | Trimestrale |
| **Churn Rate clienti** | < 10%/anno | Annuale |
| **Utenti attivi mensili (MAU)** | Crescita ≥ 20%/mese | Mensile |

---

# Sintesi

| Concetto | Valore |
|---|---|
| **Investimento iniziale** | ~42 EUR (dominio + Firebase avvio) |
| **Costi fissi mensili** | ~1–21 EUR |
| **Break Even Point** | 1 sondaggio sponsorizzato/mese (piano Standard) |
| **Tempo stimato al BEP** | Immediato (primo cliente) |
| **Profitto potenziale anno 1** | 300–6.000 EUR |

> QPé è un progetto con **barriera d'entrata economica minima** e un modello di business scalabile. Il vero investimento è il tempo di sviluppo e la crescita della community di utenti.

Riferimento indicatori finanziari: [`docs/fattibilita/ROI_Payback_VAN_TIR.md`](../fattibilita/ROI_Payback_VAN_TIR.md)
