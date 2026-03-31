import { Link } from 'react-router-dom';
import CookiePreferencesManager from '../components/CookiePreferencesManager';
import './LegalPages.css';

function CookiePolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="back-link">Torna alla home</Link>

        <h1>Cookie Policy</h1>
        <p className="last-updated">Ultimo aggiornamento: 29 marzo 2026</p>

        <section>
          <h2>1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che vengono memorizzati sul
            dispositivo dell'utente quando visita un sito web. Servono a
            ricordare le preferenze e a migliorare l'esperienza di navigazione.
          </p>
        </section>

        <section>
          <h2>2. Riferimenti normativi</h2>
          <p>
            L'uso dei cookie da parte di QPE e conforme alla Direttiva ePrivacy
            2002/58/CE (aggiornata dalla Direttiva 2009/136/CE) e al Regolamento
            (UE) 2016/679 (GDPR). In particolare, QPE richiede il consenso
            esplicito dell'utente prima di installare cookie non necessari,
            come previsto dall'Art. 5(3) della Direttiva ePrivacy.
          </p>
        </section>

        <section>
          <h2>3. Tipi di cookie utilizzati</h2>

          <h3>3.1 Cookie necessari (sempre attivi)</h3>
          <p>
            Questi cookie sono essenziali per il funzionamento della piattaforma
            e non possono essere disattivati. Non richiedono consenso ai sensi
            dell'Art. 5(3) della Direttiva ePrivacy in quanto strettamente
            necessari.
          </p>

          <div className="cookie-detail-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Durata</th>
                  <th>Finalita</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>consent_preferences</td>
                  <td>Prima parte</td>
                  <td>12 mesi</td>
                  <td>Memorizza le preferenze di consenso cookie dell'utente</td>
                </tr>
                <tr>
                  <td>__session</td>
                  <td>Prima parte</td>
                  <td>Sessione</td>
                  <td>Token di autenticazione Firebase per mantenere la sessione</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>3.2 Cookie analytics (consenso richiesto)</h3>
          <p>
            Raccolgono informazioni anonime e aggregate su come gli utenti
            utilizzano QPE. Vengono attivati SOLO dopo il consenso esplicito
            dell'utente.
          </p>

          <div className="cookie-detail-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Durata</th>
                  <th>Finalita</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>Terza parte (Google)</td>
                  <td>24 mesi</td>
                  <td>Distingue utenti anonimi per conteggio visite</td>
                </tr>
                <tr>
                  <td>_gid</td>
                  <td>Terza parte (Google)</td>
                  <td>24 ore</td>
                  <td>Identificatore sessione giornaliera anonimo</td>
                </tr>
                <tr>
                  <td>_gat</td>
                  <td>Terza parte (Google)</td>
                  <td>1 minuto</td>
                  <td>Limita la frequenza delle richieste ad analytics</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>3.3 Cookie marketing (consenso richiesto)</h3>
          <p>
            Permettono di personalizzare i sondaggi sponsorizzati. Vengono
            attivati SOLO dopo il consenso esplicito dell'utente.
          </p>

          <div className="cookie-detail-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Durata</th>
                  <th>Finalita</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_qpe_sponsored</td>
                  <td>Prima parte</td>
                  <td>6 mesi</td>
                  <td>Memorizza preferenze per sondaggi sponsorizzati</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>4. Meccanismo di consenso</h2>
          <p>
            Al primo accesso, QPE mostra un banner cookie con tre opzioni:
            "Accetta tutti" (attiva analytics e marketing), "Rifiuta tutti"
            (solo cookie necessari), "Personalizza" (scelta granulare per
            ciascuna categoria).
          </p>
          <p>
            Il consenso viene salvato nel cookie di prima parte
            "consent_preferences" con scadenza 12 mesi. Se l'utente non
            accetta analytics e/o marketing, i rispettivi sistemi NON
            vengono attivati. Il consenso puo essere revocato in qualsiasi
            momento con effetto immediato.
          </p>
        </section>

        <section>
          <h2>5. Come gestire i cookie</h2>
          <p>
            L'utente puo gestire le proprie preferenze cookie in tre modi:
            tramite il bottone "Gestisci preferenze cookie" nel footer di ogni
            pagina, dalla sezione "Privacy" nelle impostazioni dell'app,
            oppure dalle impostazioni del proprio browser.
          </p>
        </section>

        <section>
          <h2>6. Gestisci le tue preferenze</h2>
          <CookiePreferencesManager />
        </section>

        <section>
          <h2>7. Contatti</h2>
          <p>
            Per domande relative ai cookie: privacy@qpe.app
          </p>
          <p>
            Vedi anche la nostra <Link to="/privacy-policy">Privacy Policy</Link> completa.
          </p>
        </section>
      </div>
    </div>
  );
}

export default CookiePolicy;
