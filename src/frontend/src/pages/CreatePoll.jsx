import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { hasFullConsent, acceptAllCookies } from '../utils/cookieConsent';
import './CreatePoll.css';

const MAX_TAGS = 5;

// Normalizza un tag: lowercase, rimuove # e spazi
function normalizeTag(raw) {
  return raw.replace(/[#\s]/g, '').toLowerCase().slice(0, 24);
}

const COLOR_PRESETS = [
  { name: 'Rosso', value: '#e74c3c' },
  { name: 'Blu', value: '#3498db' },
  { name: 'Verde', value: '#2ecc71' },
  { name: 'Viola', value: '#9b59b6' },
  { name: 'Arancio', value: '#f39c12' },
  { name: 'Rosa', value: '#e84393' },
  { name: 'Teal', value: '#00b4d8' },
  { name: 'Scuro', value: '#2d3436' },
];

function CreatePoll() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [colorA, setColorA] = useState('#e74c3c');
  const [colorB, setColorB] = useState('#3498db');
  const [hashtags, setHashtags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cookieConsent, setCookieConsent] = useState(() => hasFullConsent());

  function handleAcceptAllCookies() {
    acceptAllCookies();
    setCookieConsent(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasFullConsent()) {
      setCookieConsent(false);
      return;
    }
    if (!title.trim() || !optionA.trim() || !optionB.trim()) {
      setError('Compila tutti i campi');
      return;
    }
    if (hashtags.length === 0) {
      setError('Aggiungi almeno un hashtag');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pollData = {
        title: title.trim(),
        optionA: { text: optionA.trim(), color: colorA, votes: 0 },
        optionB: { text: optionB.trim(), color: colorB, votes: 0 },
        hashtags,
        authorId: user.uid,
        authorUsername: userProfile?.username || user.displayName || 'anonimo',
        authorAvatar: userProfile?.avatar || '',
        voters: [],
        likes: [],
        likesCount: 0,
        totalVotes: 0,
        createdAt: serverTimestamp(),
        active: true
      };

      // Aspetta che Firestore salvi il documento, poi naviga
      const newDocRef = doc(collection(db, 'polls'));
      await setDoc(newDocRef, pollData);
      navigate(`/poll/${newDocRef.id}`);
    } catch (err) {
      console.error('[QPe] Errore creazione poll:', err);
      setError('Errore nella creazione. Riprova.');
      setLoading(false);
    }
  }

  function addTag(raw) {
    const tag = normalizeTag(raw);
    if (!tag || hashtags.includes(tag) || hashtags.length >= MAX_TAGS) return;
    setHashtags(prev => [...prev, tag]);
    setTagInput('');
  }

  function removeTag(tag) {
    setHashtags(prev => prev.filter(t => t !== tag));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && hashtags.length > 0) {
      removeTag(hashtags[hashtags.length - 1]);
    }
  }

  function handleTagBlur() {
    if (tagInput.trim()) addTag(tagInput);
  }

  if (!user) {
    return (
      <div className="create-poll-page page-enter">
        <div className="create-poll-container">
          <p className="create-poll-login-msg">
            Devi <Link to="/login">accedere</Link> per creare un sondaggio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-poll-page page-enter">
      <div className="create-poll-container">
        <Link to="/" className="back-link">&larr; Home</Link>
        <h1>Crea sondaggio</h1>
        <p className="create-poll-subtitle">Crea una coupé — due opzioni, una scelta.</p>

        {/* Cookie gate */}
        {!cookieConsent && (
          <div className="cookie-gate">
            <div className="cookie-gate-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="cookie-gate-body">
              <p className="cookie-gate-title">Cookie richiesti per pubblicare</p>
              <p className="cookie-gate-desc">
                Per creare e pubblicare sondaggi su QPe devi accettare tutti i cookie
                (necessari, analytics e marketing).
              </p>
              <div className="cookie-gate-actions">
                <button
                  type="button"
                  className="cookie-gate-btn-primary"
                  onClick={handleAcceptAllCookies}
                >
                  Accetta tutti i cookie
                </button>
                <Link to="/cookie-policy" className="cookie-gate-link">
                  Scopri perché
                </Link>
              </div>
            </div>
          </div>
        )}

        {error && <div className="create-poll-error">{error}</div>}

        {/* Preview */}
        <div className="poll-preview">
          <div className="poll-preview-top" style={{ backgroundColor: colorA }}>
            <span>{optionA || 'Opzione A'}</span>
          </div>
          <div className="poll-preview-divider" />
          <div className="poll-preview-bottom" style={{ backgroundColor: colorB }}>
            <span>{optionB || 'Opzione B'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-poll-form">
          <div className="form-field">
            <label>Domanda</label>
            <input
              type="text"
              placeholder="Es: Pizza o sushi?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
            />
            <span className="char-count">{title.length}/120</span>
          </div>

          {/* Option A */}
          <div className="form-field">
            <label>Opzione A</label>
            <div className="option-row">
              <input
                type="text"
                placeholder="Es: Pizza"
                value={optionA}
                onChange={e => setOptionA(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="color-picker-row">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.value + 'A'}
                  type="button"
                  className={`color-dot ${colorA === c.value ? 'active' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColorA(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Option B */}
          <div className="form-field">
            <label>Opzione B</label>
            <div className="option-row">
              <input
                type="text"
                placeholder="Es: Sushi"
                value={optionB}
                onChange={e => setOptionB(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="color-picker-row">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.value + 'B'}
                  type="button"
                  className={`color-dot ${colorB === c.value ? 'active' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColorB(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Hashtag */}
          <div className="form-field">
            <label>Hashtag <span className="tag-count-hint">({hashtags.length}/{MAX_TAGS})</span></label>
            <div className="hashtag-input-box">
              {hashtags.map(tag => (
                <span key={tag} className="hashtag-chip">
                  #{tag}
                  <button type="button" className="hashtag-chip-remove" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
              {hashtags.length < MAX_TAGS && (
                <input
                  className="hashtag-inline-input"
                  type="text"
                  placeholder={hashtags.length === 0 ? 'Es: sport, calcio… (Invio per aggiungere)' : 'Aggiungi tag…'}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagBlur}
                  maxLength={25}
                />
              )}
            </div>
            <span className="char-count">Premi Invio o virgola per aggiungere · Backspace per rimuovere</span>
          </div>

          <button
            type="submit"
            className={`create-poll-submit ${!cookieConsent ? 'disabled-no-cookie' : ''}`}
            disabled={loading || !cookieConsent}
            title={!cookieConsent ? 'Accetta tutti i cookie per pubblicare' : ''}
          >
            {loading ? 'Pubblicazione...' : !cookieConsent ? '🔒 Accetta i cookie per pubblicare' : 'Pubblica sondaggio'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePoll;
