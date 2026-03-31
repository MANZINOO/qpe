import { useState } from 'react';
import { Link } from 'react-router-dom';
import CookiePreferencesManager from './CookiePreferencesManager';
import './Footer.css';

function Footer() {
  const [showCookiePrefs, setShowCookiePrefs] = useState(false);

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
            <button
              className="footer-link-btn"
              onClick={() => setShowCookiePrefs(true)}
            >
              Gestisci preferenze cookie
            </button>
            <Link to="/settings">Impostazioni</Link>
          </div>
          <p className="footer-copy">QPe 2026 - Progetto GPOI</p>
        </div>
      </footer>

      {showCookiePrefs && (
        <div className="cookie-prefs-modal-overlay" onClick={() => setShowCookiePrefs(false)}>
          <div className="cookie-prefs-modal" onClick={(e) => e.stopPropagation()}>
            <CookiePreferencesManager onClose={() => setShowCookiePrefs(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
