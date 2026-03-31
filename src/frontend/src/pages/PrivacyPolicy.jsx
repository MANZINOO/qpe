import { Link } from 'react-router-dom';
import './LegalPages.css';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="back-link">Torna alla home</Link>

        <h1>Privacy Policy</h1>
        <p className="last-updated">Ultimo aggiornamento: 29 marzo 2026</p>

        <section>
          <h2>1. Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento dei dati personali e QPE Team,
            raggiungibile all'indirizzo email: privacy@qpe.app
          </p>
          <p>
            Questa privacy policy e redatta in conformita al Regolamento (UE)
            2016/679 (GDPR) e alla Direttiva ePrivacy 2002/58/CE.
          </p>
        </section>

        <section>
          <h2>2. Dati raccolti</h2>

          <h3>2.1 Dati forniti direttamente dall'utente</h3>
          <p>
            Al momento della registrazione raccogliamo: indirizzo email,
            username scelto, avatar (opzionale), categorie di interesse
            selezionate. Attraverso l'uso della piattaforma raccogliamo:
            sondaggi creati, voti espressi, commenti, relazioni di follow.
          </p>

          <h3>2.2 Dati raccolti automaticamente</h3>
          <p>
            Con il consenso dell'utente (cookie analytics), raccogliamo dati
            anonimi e aggregati sull'utilizzo della piattaforma: pagine visitate,
            tempo di permanenza, dispositivo e browser utilizzato. Questi dati
            sono completamente anonimizzati e non permettono l'identificazione
            dell'utente.
          </p>

          <h3>2.3 Dati NON raccolti</h3>
          <p>
            QPE non raccoglie: dati di geolocalizzazione precisa, dati biometrici,
            dati sanitari, orientamento politico o religioso, dati finanziari.
          </p>
        </section>

        <section>
          <h2>3. Base giuridica del trattamento</h2>
          <p>
            I dati vengono trattati sulla base di: consenso esplicito dell'utente
            (Art. 6(1)(a) GDPR) per cookie analytics e marketing, esecuzione del
            contratto (Art. 6(1)(b) GDPR) per i dati necessari al funzionamento
            del servizio, e interesse legittimo (Art. 6(1)(f) GDPR) per la
            sicurezza e la prevenzione di abusi.
          </p>
        </section>

        <section>
          <h2>4. Finalita del trattamento</h2>
          <p>I dati personali sono trattati per le seguenti finalita:</p>
          <p>
            Fornitura del servizio (creazione account, gestione sondaggi, sistema
            di voto), miglioramento del servizio (analisi anonimizzate d'uso),
            personalizzazione dell'esperienza (algoritmo di raccomandazione basato
            su preferenze esplicite e comportamento), moderazione dei contenuti
            (rilevamento automatico di contenuti inappropriati), e comunicazioni
            di servizio (notifiche relative al proprio account).
          </p>
        </section>

        <section>
          <h2>5. Condivisione dei dati</h2>

          <h3>5.1 Dati condivisi con brand/advertiser</h3>
          <p>
            I dati forniti ai brand attraverso la insight dashboard sono SEMPRE
            anonimi e aggregati. Non vengono mai condivisi dati individuali.
            Esempio di dati aggregati: "il 62% degli utenti 18-25 ha preferito
            l'opzione A". Mai: "l'utente Mario Rossi ha votato opzione A".
          </p>

          <h3>5.2 Sub-processori</h3>
          <p>
            Utilizziamo i seguenti servizi di terze parti per il funzionamento
            della piattaforma:
          </p>
          <p>
            Firebase (Google LLC) per autenticazione e database, con server in
            UE (region europe-west). Vercel Inc. per l'hosting del frontend.
            Tutti i sub-processori sono conformi al GDPR.
          </p>
        </section>

        <section>
          <h2>6. Conservazione dei dati</h2>
          <p>
            I dati dell'account vengono conservati per tutta la durata
            dell'iscrizione. Dopo l'eliminazione dell'account, tutti i dati
            personali vengono rimossi entro 30 giorni. I dati anonimi e
            aggregati (statistiche) possono essere conservati indefinitamente.
            I backup vengono eliminati secondo la stessa tempistica.
          </p>
        </section>

        <section>
          <h2>7. Diritti dell'utente (Art. 15-22 GDPR)</h2>
          <p>
            Ogni utente ha diritto di: accedere ai propri dati personali
            (Art. 15), rettificare dati inesatti (Art. 16), ottenere la
            cancellazione dei dati - "diritto all'oblio" (Art. 17), limitare
            il trattamento (Art. 18), portabilita dei dati in formato leggibile
            (Art. 20), opporsi al trattamento (Art. 21), e revocare il consenso
            in qualsiasi momento (Art. 7(3)).
          </p>
          <p>
            Questi diritti possono essere esercitati direttamente dalle
            impostazioni dell'app (sezione "I miei dati") o contattando
            privacy@qpe.app.
          </p>
        </section>

        <section>
          <h2>8. Cookie</h2>
          <p>
            QPE utilizza cookie tecnici necessari e, con il consenso dell'utente,
            cookie analytics e marketing. Per informazioni dettagliate consultare
            la nostra <Link to="/cookie-policy">Cookie Policy</Link>.
          </p>
          <p>
            Il consenso ai cookie puo essere gestito in qualsiasi momento tramite
            il link "Gestisci preferenze cookie" nel footer del sito o nelle
            impostazioni.
          </p>
        </section>

        <section>
          <h2>9. Sicurezza</h2>
          <p>
            Adottiamo misure tecniche e organizzative appropriate per proteggere
            i dati personali: comunicazioni cifrate con HTTPS/TLS, autenticazione
            sicura tramite Firebase Auth, accesso ai dati limitato al personale
            autorizzato, e monitoraggio continuo per accessi non autorizzati.
          </p>
        </section>

        <section>
          <h2>10. Minori</h2>
          <p>
            QPE non e destinato a minori di 16 anni. Non raccogliamo
            consapevolmente dati di minori di 16 anni. Se un genitore o tutore
            ritiene che il proprio figlio abbia fornito dati personali, puo
            contattarci per la rimozione.
          </p>
        </section>

        <section>
          <h2>11. Modifiche alla privacy policy</h2>
          <p>
            Ci riserviamo il diritto di modificare questa privacy policy.
            In caso di modifiche sostanziali, gli utenti verranno notificati
            via email o tramite un avviso nell'app. La data dell'ultimo
            aggiornamento e indicata in alto.
          </p>
        </section>

        <section>
          <h2>12. Contatti e reclami</h2>
          <p>
            Per esercitare i propri diritti o per qualsiasi domanda relativa
            alla privacy: privacy@qpe.app
          </p>
          <p>
            L'utente ha il diritto di presentare reclamo all'autorita di
            controllo competente (in Italia: Garante per la protezione dei
            dati personali - www.garanteprivacy.it).
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
