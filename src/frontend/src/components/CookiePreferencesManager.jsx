import { useState, useEffect } from 'react';
import {
  getConsentPreferences,
  saveConsentPreferences,
  revokeConsent
} from '../utils/cookieConsent';
import './CookiePreferencesManager.css';

// Componente riutilizzabile per gestire le preferenze cookie
// Accessibile dal footer e dalla pagina impostazioni
function CookiePreferencesManager({ onClose }) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const prefs = getConsentPreferences();
    if (prefs) {
      setAnalytics(prefs.analytics || false);
      setMarketing(prefs.marketing || false);
      if (prefs.timestamp) {
        setLastUpdated(new Date(prefs.timestamp).toLocaleDateString('it-IT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
      }
    }
  }, []);

  function handleSave() {
    saveConsentPreferences({ analytics, marketing });
    setSaved(true);
    setLastUpdated(new Date().toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    setTimeout(() => setSaved(false), 2000);
  }

  function handleRevokeAll() {
    revokeConsent();
    setAnalytics(false);
    setMarketing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="cookie-prefs-container">
      <div className="cookie-prefs-header">
        <h2>Gestisci preferenze cookie</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Chiudi">
            X
          </button>
        )}
      </div>

      {lastUpdated && (
        <p className="last-updated">
          Ultimo aggiornamento: {lastUpdated}
        </p>
      )}

      <p className="cookie-prefs-intro">
        Puoi modificare le tue preferenze in qualsiasi momento.
        Le modifiche hanno effetto immediato.
      </p>

      <div className="cookie-pref-item">
        <div className="cookie-pref-info">
          <div className="cookie-pref-title">
            <span>Cookie necessari</span>
            <span className="badge-always">Sempre attivi</span>
          </div>
          <p>
            Essenziali per il funzionamento di QPe. Includono autenticazione,
            preferenze di sessione e questo cookie di consenso.
          </p>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Durata</th>
                <th>Scopo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>consent_preferences</td>
                <td>12 mesi</td>
                <td>Salva le preferenze cookie dell'utente</td>
              </tr>
              <tr>
                <td>__session</td>
                <td>Sessione</td>
                <td>Token di autenticazione Firebase</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="cookie-pref-toggle">
          <input type="checkbox" checked disabled />
        </div>
      </div>

      <div className="cookie-pref-item">
        <div className="cookie-pref-info">
          <div className="cookie-pref-title">
            <span>Cookie analytics</span>
          </div>
          <p>
            Raccolgono dati anonimi e aggregati su come gli utenti interagiscono
            con QPe. Ci aiutano a migliorare l'esperienza senza identificare
            nessun utente.
          </p>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Durata</th>
                <th>Scopo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_ga</td>
                <td>24 mesi</td>
                <td>Distingue utenti anonimi (Google Analytics)</td>
              </tr>
              <tr>
                <td>_gid</td>
                <td>24 ore</td>
                <td>Distingue utenti anonimi (sessione giornaliera)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="cookie-pref-toggle">
          <label className="switch">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="cookie-pref-item">
        <div className="cookie-pref-info">
          <div className="cookie-pref-title">
            <span>Cookie marketing</span>
          </div>
          <p>
            Permettono di personalizzare i sondaggi sponsorizzati in base ai
            tuoi interessi. I dati non vengono mai venduti o condivisi
            individualmente con terze parti.
          </p>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Durata</th>
                <th>Scopo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_qpe_sponsored</td>
                <td>6 mesi</td>
                <td>Preferenze sondaggi sponsorizzati</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="cookie-pref-toggle">
          <label className="switch">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="cookie-prefs-actions">
        <button className="btn-revoke" onClick={handleRevokeAll}>
          Revoca tutto il consenso
        </button>
        <button className="btn-save" onClick={handleSave}>
          {saved ? 'Salvato!' : 'Salva preferenze'}
        </button>
      </div>
    </div>
  );
}

export default CookiePreferencesManager;
