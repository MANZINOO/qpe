import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRemoteConfig } from '../context/RemoteConfigContext';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
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
  const { maxPollsPerDay } = useRemoteConfig();

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
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const fileInputCover = useRef(null);
  const [posA, setPosA] = useState({ x: 50, y: 50 });
  const [posB, setPosB] = useState({ x: 50, y: 50 });
  const [zoomA, setZoomA] = useState(1.5);
  const [zoomB, setZoomB] = useState(1.5);
  const [posCover, setPosCover] = useState({ x: 50, y: 50 });
  const [zoomCover, setZoomCover] = useState(1.5);
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
    if (option === 'A') { setImageA(file); setPreviewA(preview); setPosA({ x: 50, y: 50 }); setZoomA(1.5); }
    else { setImageB(file); setPreviewB(preview); setPosB({ x: 50, y: 50 }); setZoomB(1.5); }
  }

  function removeImage(option) {
    if (option === 'A') { setImageA(null); setPreviewA(''); setPosA({ x: 50, y: 50 }); setZoomA(1.5); if (fileInputA.current) fileInputA.current.value = ''; }
    else { setImageB(null); setPreviewB(''); setPosB({ x: 50, y: 50 }); setZoomB(1.5); if (fileInputB.current) fileInputB.current.value = ''; }
  }

  async function handleCoverPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setPosCover({ x: 50, y: 50 });
    setZoomCover(1.5);
  }

  function removeCover() {
    setCoverImage(null);
    setCoverPreview('');
    setPosCover({ x: 50, y: 50 });
    setZoomCover(1.5);
    if (fileInputCover.current) fileInputCover.current.value = '';
  }

  function startDrag(e, option) {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPos = option === 'A' ? { ...posA } : option === 'B' ? { ...posB } : { ...posCover };

    function onDrag(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.max(0, Math.min(100, startPos.x - dx * 0.2));
      const newY = Math.max(0, Math.min(100, startPos.y - dy * 0.2));
      if (option === 'A') setPosA({ x: newX, y: newY });
      else if (option === 'B') setPosB({ x: newX, y: newY });
      else setPosCover({ x: newX, y: newY });
    }
    function stopDrag() {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    }
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
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
    if (userProfile?.userMode === 'limited') {
      setError('Il tuo account è in modalità limitata. Non puoi creare sondaggi per ora.');
      return;
    }

    // Controlla limite giornaliero da Remote Config (saltato per utenti Plus)
    if (user && !userProfile?.plus) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySnap = await getDocs(
        query(
          collection(db, 'polls'),
          where('authorId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(todayStart))
        )
      );
      if (todaySnap.size >= maxPollsPerDay) {
        setError(`Hai raggiunto il limite di ${maxPollsPerDay} sondaggi al giorno. Passa a QPé Plus per sondaggi illimitati!`);
        return;
      }
    }

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
        authorPlus: userProfile?.plus || false,
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
      if (imageA) {
        imageUpdate['optionA.image'] = await uploadPollImage(imageA, newDocRef.id, 'A');
        imageUpdate['optionA.imagePosX'] = Math.round(posA.x);
        imageUpdate['optionA.imagePosY'] = Math.round(posA.y);
        imageUpdate['optionA.imageZoom'] = Math.round(zoomA * 100) / 100;
      }
      if (imageB) {
        imageUpdate['optionB.image'] = await uploadPollImage(imageB, newDocRef.id, 'B');
        imageUpdate['optionB.imagePosX'] = Math.round(posB.x);
        imageUpdate['optionB.imagePosY'] = Math.round(posB.y);
        imageUpdate['optionB.imageZoom'] = Math.round(zoomB * 100) / 100;
      }
      if (coverImage) {
        const compressed = await resizeImage(coverImage, 1200, 0.85);
        const storageRef = ref(storage, `pollImages/${newDocRef.id}/cover.jpg`);
        const task = uploadBytesResumable(storageRef, compressed, { contentType: 'image/jpeg' });
        await new Promise((resolve, reject) => task.on('state_changed', null, reject, resolve));
        imageUpdate['coverImage'] = await getDownloadURL(task.snapshot.ref);
        imageUpdate['coverPosX'] = Math.round(posCover.x);
        imageUpdate['coverPosY'] = Math.round(posCover.y);
        imageUpdate['coverZoom'] = Math.round(zoomCover * 100) / 100;
      }
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
          <div className="create-poll-header-spacer" style={{ width: 32 }} />
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

        {/* Layout: su desktop preview a destra, form a sinistra */}
        <div className="create-poll-layout">

          {/* Colonna form */}
          <div className="create-poll-form-col">
            {error && <div className="create-poll-error">{error}</div>}
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

          {/* Copertina */}
          <div className="form-field">
            <label>Copertina <span className="tag-count-hint">(opzionale)</span></label>
            <input ref={fileInputCover} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverPick} />
            {coverPreview ? (
              <div className="cover-editor">
                {/* Anteprima card reale: cover + sfumatura + chip opzioni */}
                <div
                  className="cover-card-preview"
                  style={{
                    backgroundImage: `url(${coverPreview})`,
                    backgroundPosition: `${posCover.x}% ${posCover.y}%`,
                    backgroundSize: `${zoomCover * 100}%`,
                    cursor: 'grab',
                  }}
                  onMouseDown={(e) => startDrag(e, 'cover')}
                >
                  <div className="cover-card-gradient" />
                  <div className="cover-card-options">
                    <div className="cover-card-opt" style={{ background: colorA }}>
                      <span>{optionA || 'OPZIONE A'}</span>
                    </div>
                    <span className="cover-card-vs">vs</span>
                    <div className="cover-card-opt" style={{ background: colorB }}>
                      <span>{optionB || 'OPZIONE B'}</span>
                    </div>
                  </div>
                  <div className="cover-drag-hint">&#8597; trascina</div>
                </div>
                <div className="image-adjust-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                  <input type="range" className="zoom-slider" min="0.5" max="5" step="0.05" value={zoomCover} onChange={e => setZoomCover(+e.target.value)} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
                <button type="button" className="image-upload-remove" onClick={removeCover}>× rimuovi copertina</button>
              </div>
            ) : (
              <button type="button" className="image-upload-btn" onClick={() => fileInputCover.current?.click()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Aggiungi copertina
              </button>
            )}
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
            {previewA && (
              <div className="image-adjust-row" style={{ marginTop: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                <input type="range" className="zoom-slider" min="0.5" max="5" step="0.05" value={zoomA} onChange={e => setZoomA(+e.target.value)} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            )}
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
            {previewB && (
              <div className="image-adjust-row" style={{ marginTop: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                <input type="range" className="zoom-slider" min="0.5" max="5" step="0.05" value={zoomB} onChange={e => setZoomB(+e.target.value)} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            )}
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
          </div>{/* fine .create-poll-form-col */}

          {/* Colonna preview (sticky su desktop) */}
          <div className="create-poll-preview-col">
            <div className="poll-preview">
              {coverPreview ? (
                /* Preview con copertina: layout hero identico alla feed card */
                <div
                  className="poll-preview-cover-hero"
                  style={{
                    backgroundImage: `url(${coverPreview})`,
                    backgroundPosition: `${posCover.x}% ${posCover.y}%`,
                    backgroundSize: `${zoomCover * 100}%`,
                  }}
                >
                  <div className="cover-card-gradient" />
                  <div className="cover-card-options">
                    <div className="cover-card-opt" style={{ background: colorA }}>
                      <span>{optionA || 'OPZIONE A'}</span>
                    </div>
                    <span className="cover-card-vs">vs</span>
                    <div className="cover-card-opt" style={{ background: colorB }}>
                      <span>{optionB || 'OPZIONE B'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview standard: due metà */
                <div className="poll-preview-coupe">
                  <div
                    className="poll-preview-half poll-preview-top"
                    style={{
                      backgroundColor: colorA,
                      backgroundImage: previewA ? `url(${previewA})` : undefined,
                      backgroundSize: previewA ? `${zoomA * 100}%` : undefined,
                      backgroundPosition: `${posA.x}% ${posA.y}%`,
                      cursor: previewA ? 'grab' : 'default',
                    }}
                    onMouseDown={previewA ? (e) => startDrag(e, 'A') : undefined}
                  >
                    {previewA && <div className="poll-preview-overlay" />}
                    {previewA && <div className="drag-hint">&#8597; trascina</div>}
                    <span className="poll-preview-text">{optionA || 'OPZIONE A'}</span>
                  </div>
                  <div className="poll-preview-vs"><span>VS</span></div>
                  <div
                    className="poll-preview-half poll-preview-bottom"
                    style={{
                      backgroundColor: colorB,
                      backgroundImage: previewB ? `url(${previewB})` : undefined,
                      backgroundSize: previewB ? `${zoomB * 100}%` : undefined,
                      backgroundPosition: `${posB.x}% ${posB.y}%`,
                      cursor: previewB ? 'grab' : 'default',
                    }}
                    onMouseDown={previewB ? (e) => startDrag(e, 'B') : undefined}
                  >
                    {previewB && <div className="poll-preview-overlay" />}
                    {previewB && <div className="drag-hint">&#8597; trascina</div>}
                    <span className="poll-preview-text">{optionB || 'OPZIONE B'}</span>
                  </div>
                </div>
              )}
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
          </div>{/* fine .create-poll-preview-col */}

        </div>{/* fine .create-poll-layout */}
      </div>
    </div>
  );
}

export default CreatePoll;
