# Cookie e GDPR Compliance - QPE

## Panoramica

QPE implementa un sistema di gestione cookie conforme al Regolamento (UE) 2016/679 (GDPR) e alla Direttiva ePrivacy 2002/58/CE. Il sistema garantisce che nessun cookie non necessario venga installato senza il consenso esplicito dell'utente.

## Riferimenti Normativi

### GDPR - Regolamento (UE) 2016/679
Il GDPR e il regolamento europeo sulla protezione dei dati personali, applicabile dal 25 maggio 2018. I principali articoli rilevanti per QPE sono:

- **Art. 6** - Liceita del trattamento: il trattamento e lecito solo se basato su una base giuridica valida (consenso, contratto, interesse legittimo, ecc.)
- **Art. 7** - Condizioni per il consenso: il consenso deve essere libero, specifico, informato e inequivocabile. Deve poter essere revocato in qualsiasi momento.
- **Art. 12-14** - Informativa: l'utente deve essere informato in modo chiaro e trasparente su come vengono trattati i suoi dati.
- **Art. 15-22** - Diritti dell'interessato: accesso, rettifica, cancellazione (oblio), limitazione, portabilita, opposizione.
- **Art. 25** - Protezione dei dati fin dalla progettazione (privacy by design): le misure di protezione devono essere integrate nel sistema fin dall'inizio.
- **Art. 32** - Sicurezza del trattamento: misure tecniche e organizzative adeguate.

### Direttiva ePrivacy 2002/58/CE
La Direttiva ePrivacy (aggiornata dalla Direttiva 2009/136/CE) disciplina specificamente l'uso di cookie e tecnologie di tracciamento.

- **Art. 5(3)** - Consenso obbligatorio: l'installazione di cookie sul terminale dell'utente richiede il consenso preventivo, ad eccezione dei cookie strettamente necessari alla fornitura del servizio.

## Implementazione Tecnica

### Architettura del Sistema di Consenso

Il sistema di consenso e implementato interamente lato client utilizzando JavaScript puro e la libreria `js-cookie`.

**File principali:**
- `src/frontend/src/utils/cookieConsent.js` - Logica core di gestione consenso
- `src/frontend/src/components/CookieBanner.jsx` - Banner cookie al primo accesso
- `src/frontend/src/components/CookiePreferencesManager.jsx` - Pannello gestione preferenze

### Flusso del Consenso

1. **Primo accesso:** L'utente vede il cookie banner con tre opzioni: "Accetta tutti", "Rifiuta tutti", "Personalizza"
2. **Personalizzazione:** Cliccando "Personalizza", l'utente puo selezionare singolarmente le categorie analytics e marketing
3. **Salvataggio:** Le preferenze vengono salvate nel cookie `consent_preferences` con scadenza 12 mesi
4. **Attivazione condizionale:** I sistemi analytics e marketing vengono attivati SOLO se il relativo consenso e stato dato
5. **Gestione successiva:** L'utente puo modificare le preferenze in qualsiasi momento dal footer ("Gestisci preferenze cookie") o dalle impostazioni

### Cookie `consent_preferences`

Questo cookie di prima parte salva le preferenze dell'utente in formato JSON:

```json
{
  "necessary": true,
  "analytics": false,
  "marketing": false,
  "timestamp": "2026-03-29T12:00:00.000Z",
  "version": "1.0"
}
```

Caratteristiche:
- **Tipo:** Cookie di prima parte (first-party)
- **Durata:** 12 mesi (365 giorni)
- **SameSite:** Lax
- **Secure:** true (su HTTPS)
- **HttpOnly:** No (deve essere leggibile da JavaScript)

### Comportamento condizionale

```
Se consent_preferences non esiste:
  -> Mostra banner cookie
  -> NON attivare analytics
  -> NON attivare marketing
  -> Attiva solo cookie necessari

Se consent_preferences esiste:
  -> NON mostrare banner
  -> Leggi preferenze
  -> Se analytics == true: attiva Google Analytics
  -> Se marketing == true: attiva sondaggi sponsorizzati personalizzati
  -> Cookie necessari sempre attivi
```

### Revoca del consenso

La revoca ha effetto immediato:
1. Le preferenze vengono aggiornate nel cookie `consent_preferences`
2. I cookie analytics (`_ga`, `_gid`, `_gat`) vengono rimossi
3. I cookie marketing (`_qpe_sponsored`) vengono rimossi
4. I sistemi di tracciamento vengono disattivati immediatamente

## Elenco Completo dei Cookie

### Cookie Necessari (sempre attivi)

| Nome | Tipo | Durata | Finalita |
|------|------|--------|----------|
| consent_preferences | Prima parte | 12 mesi | Salva le preferenze di consenso cookie dell'utente |
| __session | Prima parte | Sessione | Token di autenticazione Firebase |

### Cookie Analytics (consenso richiesto)

| Nome | Tipo | Durata | Finalita |
|------|------|--------|----------|
| _ga | Terza parte (Google) | 24 mesi | Distingue utenti anonimi per Google Analytics |
| _gid | Terza parte (Google) | 24 ore | Identificatore sessione giornaliera anonimo |
| _gat | Terza parte (Google) | 1 minuto | Rate limiting delle richieste ad analytics |

### Cookie Marketing (consenso richiesto)

| Nome | Tipo | Durata | Finalita |
|------|------|--------|----------|
| _qpe_sponsored | Prima parte | 6 mesi | Preferenze per personalizzazione sondaggi sponsorizzati |

## Diritti dell'Utente (GDPR)

QPE implementa i seguenti diritti direttamente nell'app (Impostazioni > Privacy e Dati):

### Diritto di accesso (Art. 15)
L'utente puo visualizzare tutti i propri dati dalla pagina impostazioni.

### Diritto alla portabilita (Art. 20)
Funzione "Scarica i miei dati": genera un file JSON contenente tutti i dati personali dell'utente (profilo, sondaggi creati, voti, commenti, like, relazioni, storico consensi).

### Diritto alla cancellazione / oblio (Art. 17)
Funzione "Elimina il mio account e tutti i miei dati": procedura a due step con conferma testuale ("ELIMINA"). Dopo la conferma, tutti i dati personali vengono eliminati entro 30 giorni. I dati anonimi e aggregati gia forniti ad advertiser non vengono rimossi in quanto non riconducibili all'utente.

### Diritto alla revoca del consenso (Art. 7(3))
Il consenso ai cookie puo essere revocato in qualsiasi momento tramite:
- Il link "Gestisci preferenze cookie" nel footer
- La sezione "Preferenze cookie" nelle impostazioni
- La pagina Cookie Policy

La revoca ha effetto immediato e non pregiudica la liceita del trattamento basato sul consenso prestato prima della revoca.

## Dati condivisi con terze parti

### Brand / Advertiser (Insight Dashboard)
I dati forniti ai brand attraverso la insight dashboard sono SEMPRE:
- **Anonimi:** nessun dato identificativo individuale
- **Aggregati:** statistiche minimo su gruppi di 10+ utenti
- **Esempio consentito:** "62% degli utenti 18-25 ha votato opzione A"
- **Esempio NON consentito:** "L'utente mario.rossi ha votato opzione A"

### Sub-processori
- **Firebase (Google LLC):** Autenticazione e database. Server in UE (europe-west). Conforme GDPR.
- **Vercel Inc.:** Hosting frontend. Conforme GDPR.

## Privacy by Design (Art. 25 GDPR)

QPE implementa il principio di privacy by design:

1. **Risultati nascosti:** I risultati dei sondaggi sono nascosti fino al voto per eliminare il bias da maggioranza
2. **Minimizzazione dati:** Raccogliamo solo i dati strettamente necessari al funzionamento
3. **Consenso granulare:** L'utente sceglie individualmente ogni categoria di cookie
4. **Default sicuro:** Senza consenso esplicito, solo i cookie necessari sono attivi
5. **Trasparenza:** Ogni cookie e documentato con nome, durata e finalita

## Contatti

Per questioni relative alla privacy e GDPR: privacy@qpe.app
