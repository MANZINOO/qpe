import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './CreatePoll.css';

const CATEGORIES = [
  'Sport', 'Politica', 'Cultura', 'Cibo', 'Tecnologia',
  'Musica', 'Cinema', 'Viaggi', 'Moda', 'Scienza', 'Gaming', 'Altro'
];

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
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !optionA.trim() || !optionB.trim()) {
      setError('Compila tutti i campi');
      return;
    }
    if (!category) {
      setError('Seleziona una categoria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pollData = {
        title: title.trim(),
        optionA: { text: optionA.trim(), color: colorA, votes: 0 },
        optionB: { text: optionB.trim(), color: colorB, votes: 0 },
        category,
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

      const docRef = await addDoc(collection(db, 'polls'), pollData);
      navigate(`/poll/${docRef.id}`);
    } catch (err) {
      console.error('[QPe] Errore creazione poll:', err);
      setError('Errore nella creazione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="create-poll-page">
        <div className="create-poll-container">
          <p className="create-poll-login-msg">
            Devi <Link to="/login">accedere</Link> per creare un sondaggio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-poll-page">
      <div className="create-poll-container">
        <Link to="/" className="back-link">&larr; Home</Link>
        <h1>Crea sondaggio</h1>
        <p className="create-poll-subtitle">Crea una coupé — due opzioni, una scelta.</p>

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

          {/* Category */}
          <div className="form-field">
            <label>Categoria</label>
            <div className="categories-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${category === cat ? 'selected' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="create-poll-submit" disabled={loading}>
            {loading ? 'Pubblicazione...' : 'Pubblica sondaggio'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePoll;
