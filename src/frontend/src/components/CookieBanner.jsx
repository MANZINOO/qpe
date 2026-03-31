import { useState, useEffect } from 'react';
import {
  shouldShowBanner,
  acceptAllCookies,
  rejectAllCookies,
  saveConsentPreferences,
  getConsentPreferences
} from '../utils/cookieConsent';
import './CookieBanner.css';

function CookieBanner({ onConsentGiven }) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (shouldShowBanner()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAcceptAll() {
    acceptAllCookies();
    setVisible(false);
    if (onConsentGiven) onConsentGiven();
  }

  function handleRejectAll() {
    rejectAllCookies();
    setVisible(false);
    if (onConsentGiven) onConsentGiven();
  }

  function handleSavePreferences() {
    saveConsentPreferences({ analytics, marketing });
    setVisible(false);
    if (onConsentGiven) onConsentGiven();
  }

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner">
        <div className="cookie-banner-header">
          <h3>Informativa sui Cookie</h3>
        </div>

        <div className="cookie-banner-body">
          <p>
            QPe utilizza cookie per garantire il funzionamento del sito e, con il tuo
            consenso, per analisi anonimizzate e contenuti personalizzati.
            Puoi scegliere quali cookie accettare.
          </p>

          {showDetails && (
            <div className="cookie-details">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                    />
                    <span className="cookie-label">Necessari</span>
                    <span className="cookie-badge always-on">Sempre attivi</span>
                  </label>
                </div>
                <p className="cookie-desc">
                  Cookie essenziali per il funzionamento del sito. Includono
                  autenticazione, preferenze di consenso e sicurezza.
                  Non possono essere disattivati.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                    />
                    <span className="cookie-label">Analytics</span>
                  </label>
                </div>
                <p className="cookie-desc">
                  Ci aiutano a capire come gli utenti usano QPe raccogliendo dati
                  anonimi e aggregati. Nessun dato personale viene condiviso.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                    />
                    <span className="cookie-label">Marketing</span>
                  </label>
                </div>
                <p className="cookie-desc">
                  Permettono di mostrare sondaggi sponsorizzati rilevanti in base
                  ai tuoi interessi. I dati non vengono mai venduti a terzi.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="cookie-banner-actions">
          {showDetails ? (
            <>
              <button className="btn-secondary" onClick={handleRejectAll}>
                Rifiuta tutti
              </button>
              <button className="btn-primary" onClick={handleSavePreferences}>
                Salva preferenze
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleRejectAll}>
                Rifiuta tutti
              </button>
              <button className="btn-tertiary" onClick={() => setShowDetails(true)}>
                Personalizza
              </button>
              <button className="btn-primary" onClick={handleAcceptAll}>
                Accetta tutti
              </button>
            </>
          )}
        </div>

        <div className="cookie-banner-footer">
          <a href="/privacy-policy">Privacy Policy</a>
          <span className="separator">|</span>
          <a href="/cookie-policy">Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
