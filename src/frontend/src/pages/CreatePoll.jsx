import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { hasFullConsent, acceptAllCookies } from '../utils/cookieConsent';
import { resizeImage } from '../utils/imageUtils';
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
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [colorA, setColorA] = useState('#e74c3c');
  const [colorB, setColorB] = useState('#3498db');
  const [imageA, setImageA] = useState(null);   // File
  const [imageB, setImageB] = useState(null);   // File
  const [previewA, setPreviewA] = useState(''); // data URL
  const [previewB, setPreviewB] = useState(''); // data URL
  const fileInputA = useRef(null);
  const fileInputB = useRef(null);
  const [hashtags, setHashtags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cookieConsent, setCookieConsent] = useState(() => hasFullConsent());

  function handleAcceptAllCookies() {
    acceptAllCookies();
    setCookieConsent(true);
  }

  async function handleImagePick(e, option) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (option === 'A') { setImageA(file); setPreviewA(preview); }
    else { setImageB(file); setPreviewB(preview); }
  }

  function removeImage(option) {
    if (option === 'A') { setImageA(null); setPreviewA(''); if (fileInputA.current) fileInputA.current.value = ''; }
    else { setImageB(null); setPreviewB(''); if (fileInputB.current) fileInputB.current.value = ''; }
  }

  async function uploadPollImage(file, pollId, option) {
    const compressed = await resizeImage(file, 900, 0.85);
    const storageRef = ref(storage, `pollImages/${pollId}/option${option}.jpg`);
    const task = uploadBytesResumable(storageRef, compressed, { contentType: 'image/jpeg' });
    await new Promise((resolve, reject) => task.on('state_changed', null, reject, resolve));
    return getDownloadURL(task.snapshot.ref);
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
      const newDocRef = doc(collection(db, 'polls'));

      const pollData = {
        title: title.trim(),
        optionA: { text: optionA.trim(), color: colorA, votes: 0 },
        optionB: { text: optionB.trim(), color: colorB, votes: 0 },
        hashtags,
        authorId: user.uid,
        authorUsername: userProfile?.username || user.displayName || 'anonimo',
        authorAvatar: userProfile?.avatar || '',
        authorIsPrivate: userProfile?.isPrivate || false,
        voters: [],
        likes: [],
        likesCount: 0,
        totalVotes: 0,
        createdAt: serverTimestamp(),
        active: true
      };

      await setDoc(newDocRef, pollData);

      // Upload immagini se presenti
      const imageUpdate = {};
      if (imageA) imageUpdate['optionA.image'] = await uploadPollImage(imageA, newDocRef.id, 'A');
      if (imageB) imageUpdate['optionB.image'] = await uploadPollImage(imageB, newDocRef.id, 'B');
      if (Object.keys(imageUpdate).length > 0) await updateDoc(newDocRef, imageUpdate);

      // Ascolta la moderazione automatica: max 8s, se il doc sparisce mostra errore
      let deleted = false;
      await new Promise((resolve) => {
        let firstSnap = true;
        const unsub = onSnapshot(newDocRef, (snap) => {
          if (firstSnap) { firstSnap = false; return; }
          if (!snap.exists()) { deleted = true; unsub(); resolve(); }
        });
        setTimeout(() => { unsub(); resolve(); }, 8000);
      });

      if (deleted) {
        toast.error('Ops, c\'è stato un problema — Contenuto non consentito dalla community.');
        setLoading(false);
        return;
      }

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
        <div className="create-poll-header">
          <Link to="/" className="create-poll-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1>Crea sondaggio</h1>
          <div style={{ width: 32 }} />
        </div>
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

        {/* Preview — identica alla coupé reale */}
        <div className="poll-preview">
          <div className="poll-preview-coupe">
            <div className="poll-preview-half poll-preview-top" style={{
              backgroundColor: colorA,
              backgroundImage: previewA ? `url(${previewA})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {previewA && <div className="poll-preview-overlay" />}
              <span className="poll-preview-text">{optionA || 'OPZIONE A'}</span>
            </div>

            <div className="poll-preview-vs">
              <span>VS</span>
            </div>

            <div className="poll-preview-half poll-preview-bottom" style={{
              backgroundColor: colorB,
              backgroundImage: previewB ? `url(${previewB})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {previewB && <div className="poll-preview-overlay" />}
              <span className="poll-preview-text">{optionB || 'OPZIONE B'}</span>
            </div>
          </div>

          <div className="poll-preview-footer">
            <div className="poll-preview-author">
              <div className="poll-preview-avatar">
                {(userProfile?.username || '?')[0].toUpperCase()}
              </div>
              <span>@{userProfile?.username || 'tu'}</span>
            </div>
            <p className="poll-preview-title">{title || 'Titolo del sondaggio'}</p>
            <div className="poll-preview-stats">
              <span>0 voti</span>
              <span>0 ♥</span>
              <span>👁 0</span>
            </div>
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
            <div className="image-upload-row">
              <input ref={fileInputA} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImagePick(e, 'A')} />
              {previewA ? (
                <div className="image-upload-preview">
                  <img src={previewA} alt="Sfondo A" />
                  <button type="button" className="image-upload-remove" onClick={() => removeImage('A')}>× rimuovi</button>
                </div>
              ) : (
                <button type="button" className="image-upload-btn" onClick={() => fileInputA.current?.click()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Aggiungi sfondo
                </button>
              )}
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
            <div className="image-upload-row">
              <input ref={fileInputB} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImagePick(e, 'B')} />
              {previewB ? (
                <div className="image-upload-preview">
                  <img src={previewB} alt="Sfondo B" />
                  <button type="button" className="image-upload-remove" onClick={() => removeImage('B')}>× rimuovi</button>
                </div>
              ) : (
                <button type="button" className="image-upload-btn" onClick={() => fileInputB.current?.click()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Aggiungi sfondo
                </button>
              )}
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
