import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// Categorie disponibili al signup
const CATEGORIES = [
  'Sport', 'Politica', 'Cultura', 'Cibo',
  'Tecnologia', 'Musica', 'Cinema', 'Viaggi',
  'Moda', 'Scienza', 'Gaming', 'Altro'
];

function Signup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  }

  async function handleStep1(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono.');
      return;
    }

    if (username.length < 3) {
      setError('Lo username deve avere almeno 3 caratteri.');
      return;
    }

    setStep(2);
  }

  async function handleStep2() {
    setError('');
    setLoading(true);

    try {
      await signup(email, password, username);
      if (selectedCategories.length > 0) {
        await updateUserProfile({ categories: selectedCategories });
      }
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Questa email e gia registrata.');
        setStep(1);
      } else if (err.code === 'auth/weak-password') {
        setError('La password e troppo debole.');
        setStep(1);
      } else {
        setError('Errore durante la registrazione. Riprova.');
      }
    }

    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Errore durante la registrazione con Google.');
      }
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-logo"><span className="logo-qp">qp</span><span className="logo-accent">e</span></h1>
        <h2>Crea il tuo account</h2>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <>
            <form onSubmit={handleStep1} className="auth-form">
              <div className="auth-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Scegli un username"
                  required
                  minLength={3}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Almeno 6 caratteri"
                  required
                  minLength={6}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirm">Conferma password</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ripeti la password"
                  required
                />
              </div>

              <button type="submit" className="auth-btn-primary">
                Continua
              </button>
            </form>

            <div className="auth-divider">
              <span>oppure</span>
            </div>

            <button
              className="auth-btn-google"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continua con Google
            </button>

            <p className="auth-switch">
              Hai gia un account? <Link to="/login">Accedi</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <div className="categories-step">
            <p className="categories-intro">
              Scegli le categorie che ti interessano per personalizzare il tuo feed.
              Puoi cambiarle in qualsiasi momento.
            </p>

            <div className="categories-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="categories-actions">
              <button
                className="auth-btn-secondary"
                onClick={() => handleStep2()}
                disabled={loading}
              >
                Salta
              </button>
              <button
                className="auth-btn-primary"
                onClick={() => handleStep2()}
                disabled={loading}
              >
                {loading ? 'Creazione...' : 'Inizia'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
