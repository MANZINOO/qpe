// Gestione consenso cookie GDPR
// Cookie di prima parte "consent_preferences" con scadenza 12 mesi

import Cookies from 'js-cookie';

const CONSENT_COOKIE_NAME = 'consent_preferences';
const CONSENT_EXPIRY_DAYS = 365;

// Struttura default del consenso
const DEFAULT_CONSENT = {
  necessary: true,    // Sempre attivo, non disattivabile
  analytics: false,   // Tracciamento comportamento anonimizzato
  marketing: false,   // Sondaggi sponsorizzati personalizzati
  timestamp: null,
  version: '1.0'
};

// Legge le preferenze salvate nel cookie
export function getConsentPreferences() {
  const raw = Cookies.get(CONSENT_COOKIE_NAME);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    // Necessari sempre attivi
    parsed.necessary = true;
    return parsed;
  } catch {
    return null;
  }
}

// Salva le preferenze nel cookie di prima parte
export function saveConsentPreferences(preferences) {
  const consent = {
    necessary: true, // Sempre attivo
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    timestamp: new Date().toISOString(),
    version: '1.0'
  };

  Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(consent), {
    expires: CONSENT_EXPIRY_DAYS,
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:'
  });

  // Attiva o disattiva i sistemi in base al consenso
  applyConsentPreferences(consent);

  return consent;
}

// Accetta tutto
export function acceptAllCookies() {
  return saveConsentPreferences({
    analytics: true,
    marketing: true
  });
}

// Rifiuta tutto (solo necessari)
export function rejectAllCookies() {
  return saveConsentPreferences({
    analytics: false,
    marketing: false
  });
}

// Revoca il consenso con effetto immediato
export function revokeConsent() {
  const consent = saveConsentPreferences({
    analytics: false,
    marketing: false
  });
  // Rimuove eventuali cookie analytics/marketing esistenti
  removeAnalyticsCookies();
  removeMarketingCookies();
  return consent;
}

// Controlla se il banner deve essere mostrato
export function shouldShowBanner() {
  return getConsentPreferences() === null;
}

// Controlla se un tipo specifico di cookie e consentito
export function isConsentGiven(type) {
  const prefs = getConsentPreferences();
  if (!prefs) return type === 'necessary';
  return Boolean(prefs[type]);
}

// Applica le preferenze attivando/disattivando i sistemi
function applyConsentPreferences(consent) {
  if (consent.analytics) {
    initAnalytics();
  } else {
    disableAnalytics();
  }

  if (consent.marketing) {
    initMarketing();
  } else {
    disableMarketing();
  }
}

// Placeholder: inizializza analytics (es. Google Analytics anonimizzato)
function initAnalytics() {
  console.log('[QPE] Analytics attivato (consenso utente)');
  // TODO: Integrare analytics reale quando disponibile
}

function disableAnalytics() {
  console.log('[QPE] Analytics disattivato');
  removeAnalyticsCookies();
}

// Placeholder: inizializza marketing (sondaggi sponsorizzati personalizzati)
function initMarketing() {
  console.log('[QPE] Marketing attivato (consenso utente)');
  // TODO: Integrare sistema sondaggi sponsorizzati
}

function disableMarketing() {
  console.log('[QPE] Marketing disattivato');
  removeMarketingCookies();
}

function removeAnalyticsCookies() {
  // Rimuove cookie analytics se presenti
  Cookies.remove('_ga');
  Cookies.remove('_gid');
  Cookies.remove('_gat');
}

function removeMarketingCookies() {
  // Rimuove cookie marketing se presenti
  Cookies.remove('_fbp');
  Cookies.remove('_qpe_sponsored');
}

// Inizializza il sistema di consenso al caricamento della pagina
export function initConsentSystem() {
  const prefs = getConsentPreferences();
  if (prefs) {
    applyConsentPreferences(prefs);
  }
}
