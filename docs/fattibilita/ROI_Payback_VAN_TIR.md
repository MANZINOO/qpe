Indicatori di Redditività — QPé
================================
[TOC]

v1.0.0 - 07/04/2026

Analisi degli indicatori di redditività applicati al modello di business di QPé.

---

# ROI — Return on Investment

Misura la percentuale di ritorno economico generato dall'investimento iniziale.

$$
\text{ROI} = \frac{\text{Guadagno Netto dall'Investimento}}{\text{Costo dell'Investimento}} \times 100
$$

## Applicazione a QPé

**Investimento iniziale stimato:**

| Voce | Importo |
|---|---|
| Ore di sviluppo (6 mesi × team) | 0 EUR (progetto scolastico) |
| Dominio .app (1 anno) | 12 EUR |
| Firebase Blaze (fase beta) | ~5 EUR/mese × 6 = 30 EUR |
| Strumenti (Figma, IDE premium) | 0 EUR (free tier) |
| **Totale investimento iniziale** | **~42 EUR** |

**Ricavi stimati (primo anno dopo lancio):**

| Fonte | Stima |
|---|---|
| 3 sondaggi sponsorizzati × 100 EUR | 300 EUR |
| 1 brand insight dashboard × 150 EUR/mese × 6 mesi | 900 EUR |
| **Totale ricavi anno 1** | **1.200 EUR** |

**Costi operativi anno 1:** ~120 EUR (dominio + Firebase oltre free tier)

**Guadagno netto = 1.200 - 120 = 1.080 EUR**

$$
\text{ROI} = \frac{1.080}{42} \times 100 \approx 2.571\%
$$

> L'investimento monetario iniziale è molto basso (progetto scolastico su free tier), quindi il ROI risulta estremamente alto anche con ricavi modesti.

---

# Payback Period

Il tempo necessario affinché i ricavi netti generati da QPé ripaghino l'investimento iniziale.

$$
\text{Payback Period} = \frac{\text{Investimento Iniziale}}{\text{Ricavo Netto Annuale}}
$$

## Payback con flussi variabili (scenario realistico)

Investimento iniziale: **42 EUR**
Flussi di cassa netti mensili stimati:

| Mese | Ricavi (EUR) | Costi (EUR) | Flusso Netto (EUR) | Cumulativo (EUR) |
|------|-------------|------------|-------------------|-----------------|
| **0** | 0 | **42** (avvio) | **-42** | **-42** |
| 1 | 0 | 5 | -5 | -47 |
| 2 | 0 | 5 | -5 | -52 |
| 3 | 100 | 5 | +95 | +43 |

**Payback Period ≈ 3 mesi** (dal primo sondaggio sponsorizzato)

---

# VAN — Valore Attuale Netto (Net Present Value)

Il valore attuale di tutti i flussi di cassa futuri, attualizzati al loro valore odierno. Considera il costo-opportunità del capitale.

$$
\text{VAN} = \sum_{n=1}^{N} \frac{\text{Flusso di Cassa}_n}{(1 + r)^n} - \text{Investimento Iniziale}
$$

## Applicazione a QPé (orizzonte 3 anni, tasso di sconto 10%)

| Anno | Flusso di Cassa (EUR) | Fattore attualizzazione | Valore Attuale (EUR) |
|------|----------------------|------------------------|---------------------|
| 1 | 1.080 | 1/(1,10)¹ = 0,909 | 981 |
| 2 | 2.500 | 1/(1,10)² = 0,826 | 2.065 |
| 3 | 5.000 | 1/(1,10)³ = 0,751 | 3.755 |
| **Totale VA** | | | **6.801** |

$$
\text{VAN} = 6.801 - 42 = +6.759 \text{ EUR}
$$

**Interpretazione:**
- VAN > 0 → **Il progetto crea valore. ACCETTARE.**
- VAN = 0 → Pareggio. VALUTARE.
- VAN < 0 → Il progetto distrugge valore. RIFIUTARE.

---

# TIR — Tasso Interno di Rendimento (IRR)

Il tasso di sconto che rende il VAN del progetto uguale a zero. Rappresenta il rendimento "effettivo" dell'investimento.

$$
0 = \sum_{n=1}^{N} \frac{\text{Flusso di Cassa}_n}{(1 + \text{TIR})^n} - \text{Investimento Iniziale}
$$

Per QPé, con i flussi sopra indicati e l'investimento di 42 EUR, il TIR risulta **> 1.000%** (l'investimento iniziale è irrisorio rispetto ai flussi futuri).

**Interpretazione:**
- TIR > Costo del Capitale (10%) → **ACCETTARE** ✓
- TIR = Costo del Capitale → VALUTARE
- TIR < Costo del Capitale → RIFIUTARE

---

# Riepilogo e Decisione Finale

| Indicatore | Valore QPé | Soglia | Interpretazione |
|---|---|---|---|
| **ROI** | ~2.571% | > 100% | Eccellente — investimento minimo, ricavi sostenibili |
| **Payback Period** | ~3 mesi | < 12 mesi | Ottimo — recupero rapidissimo |
| **VAN** | +6.759 EUR | > 0 | Positivo — il progetto crea valore |
| **TIR** | > 1.000% | > 10% | Eccellente — rendimento superiore a qualsiasi soglia |

**Raccomandazione finanziaria:** Il progetto QPé è **finanziariamente conveniente** grazie ai costi di sviluppo bassissimi (free tier Firebase + progetto scolastico) e al modello di revenue B2B con sondaggi sponsorizzati.

---

# Note metodologiche

- I calcoli assumono ricavi conservativi (scenario base, non ottimistico)
- L'investimento non include il costo del lavoro degli sviluppatori (progetto scolastico)
- Per una startup commerciale, includere il costo-opportunità delle ore di sviluppo renderebbe il payback 12–18 mesi
- Usare **Excel** con le funzioni `VAN()` e `TIR()` per scenari più complessi
- Riferimento: [`docs/economy_finance/break_even_point.md`](../economy_finance/break_even_point.md)
