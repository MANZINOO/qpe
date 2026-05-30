import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { functions } from '../firebase';
import './Plus.css';

const FEATURES = [
  { icon: '♾️', label: 'Sondaggi illimitati al giorno' },
  { icon: '⭐', label: 'Badge stella dorata sul profilo e nel feed' },
  { icon: '🚀', label: 'Supporta lo sviluppo di QPé' },
];

function Plus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubscribe() {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    setError('');
    try {
      const createSession = httpsCallable(functions, 'createCheckoutSession');
      const { data } = await createSession();
      window.location.href = data.url;
    } catch (err) {
      console.error('[QPe Plus]', err);
      setError('Errore nell\'avvio del pagamento. Riprova.');
      setLoading(false);
    }
  }

  return (
    <div className="plus-page page-enter">
      <div className="plus-topbar">
        <button className="plus-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="plus-topbar-title">QPé Plus</span>
        <div style={{ width: 32 }} />
      </div>

      <div className="plus-container">
        <div className="plus-hero">
          <span className="plus-star">⭐</span>
          <h1 className="plus-title">QPé Plus</h1>
          <p className="plus-subtitle">Il modo migliore per vivere QPé</p>
        </div>

        <div className="plus-price-card">
          <span className="plus-price">€3</span>
          <span className="plus-price-period">/mese</span>
        </div>

        <ul className="plus-features">
          {FEATURES.map(f => (
            <li key={f.label} className="plus-feature-item">
              <span className="plus-feature-icon">{f.icon}</span>
              <span className="plus-feature-label">{f.label}</span>
            </li>
          ))}
        </ul>

        {error && <p className="plus-error">{error}</p>}

        <button
          className="plus-cta"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Reindirizzamento...' : 'Abbonati a €3/mese'}
        </button>

        <p className="plus-legal">
          Pagamento sicuro tramite Stripe. Annulla quando vuoi.{' '}
          <Link to="/privacy-policy">Privacy</Link>
        </p>
      </div>
    </div>
  );
}

export default Plus;
