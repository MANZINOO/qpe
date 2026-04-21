import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import './Search.css';

// Debounce: aspetta ms millisecondi dopo l'ultima digitazione prima di cercare
function useDebounce(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [term, setTerm] = useState('');
  const [tab, setTab] = useState('users'); // 'users' | 'polls'
  const [users, setUsers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // true dopo la prima ricerca

  const debouncedTerm = useDebounce(term, 350);

  // Foca l'input all'apertura
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lancia la ricerca ogni volta che cambia il termine debounced o il tab
  useEffect(() => {
    const t = debouncedTerm.trim();
    if (t.length < 1) {
      setUsers([]);
      setPolls([]);
      setSearched(false);
      return;
    }
    if (tab === 'users') searchUsers(t);
    else searchPolls(t);
  }, [debouncedTerm, tab]);

  async function searchUsers(t) {
    setLoading(true);
    try {
      // Prefix matching case-sensitive (Firestore non supporta full-text)
      // Cerca anche con prima lettera maiuscola per coprire i casi più comuni
      const termLower = t.toLowerCase();
      const termCap   = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();

      const makeQ = (startTerm) => query(
        collection(db, 'users'),
        where('username', '>=', startTerm),
        where('username', '<=', startTerm + '\uf8ff'),
        orderBy('username'),
        limit(15)
      );

      const [snap1, snap2] = await Promise.all([getDocs(makeQ(termLower)), getDocs(makeQ(termCap))]);

      // Unisci ed elimina duplicati per uid
      const map = new Map();
      [...snap1.docs, ...snap2.docs].forEach(d => map.set(d.id, { uid: d.id, ...d.data() }));
      setUsers([...map.values()].slice(0, 15));
    } catch (err) {
      console.error('[QPe] Errore ricerca utenti:', err);
      setUsers([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  async function searchPolls(t) {
    setLoading(true);
    try {
      // Firestore non supporta substring search nativo:
      // si scaricano i 300 sondaggi più recenti e si filtra client-side
      // per titolo (contains) e hashtag (contains), con o senza # iniziale
      const termLower = t.replace(/^#/, '').toLowerCase().trim();

      const snap = await getDocs(query(
        collection(db, 'polls'),
        orderBy('createdAt', 'desc'),
        limit(300)
      ));

      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p =>
          p.title?.toLowerCase().includes(termLower) ||
          p.hashtags?.some(tag => tag.toLowerCase().includes(termLower))
        )
        .slice(0, 20);

      setPolls(results);
    } catch (err) {
      console.error('[QPe] Errore ricerca sondaggi:', err);
      setPolls([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const trimmed = term.trim();
  const noResults = searched && !loading && (
    (tab === 'users' && users.length === 0) ||
    (tab === 'polls' && polls.length === 0)
  );

  return (
    <div className="search-page page-enter">
      {/* Header */}
      <div className="search-header">
        <button className="search-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="search-input-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Cerca utenti o sondaggi..."
            value={term}
            onChange={e => setTerm(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {term && (
            <button className="search-clear" onClick={() => { setTerm(''); inputRef.current?.focus(); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="search-tabs">
        <button
          className={`search-tab ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          Utenti
        </button>
        <button
          className={`search-tab ${tab === 'polls' ? 'active' : ''}`}
          onClick={() => setTab('polls')}
        >
          Sondaggi
        </button>
      </div>

      {/* Contenuto */}
      {trimmed.length < 1 ? (
        <div className="search-hint">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>Cerca per {tab === 'polls' ? 'titolo o hashtag' : 'username'}</p>
        </div>
      ) : loading ? (
        <div className="search-skeleton-list">
          {[...Array(4)].map((_, i) => (
            <div className="skeleton-notif" key={i}>
              <div className="skeleton skeleton-circle" style={{ width: 44, height: 44, flexShrink: 0 }} />
              <div className="skeleton-notif-body">
                <div className="skeleton skeleton-text" style={{ width: 120, marginBottom: 0 }} />
                <div className="skeleton skeleton-text medium" style={{ marginBottom: 0 }} />
              </div>
            </div>
          ))}
        </div>
      ) : noResults ? (
        <div className="search-empty">
          <p>Nessun risultato per <strong>"{trimmed}"</strong></p>
          <span>{tab === 'polls' ? 'Nessun sondaggio trovato per titolo o hashtag' : 'Prova con un termine diverso — la ricerca funziona per prefisso'}</span>
        </div>
      ) : tab === 'users' ? (
        <ul className="search-results">
          {users.map((u, i) => (
            <li key={u.uid} className="stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <Link to={u.uid === user?.uid ? '/profile' : `/u/${u.uid}`} className="search-user-item">
                <div className="search-avatar">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" />
                  ) : (
                    <span>{(u.username || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="search-user-info">
                  <span className="search-username">
                    @{u.username}
                    {u.uid === user?.uid && <span className="search-you-badge">sei tu!</span>}
                  </span>
                  {u.bio && <span className="search-bio">{u.bio}</span>}
                </div>
                <div className="search-user-meta">
                  <span>{u.followers?.length || 0} follower</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="search-results">
          {polls.map((p, i) => (
            <li key={p.id} className="stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <Link to={`/poll/${p.id}`} className="search-poll-item">
                <div className="search-poll-colors">
                  <div style={{ background: p.optionA?.color || '#333' }} />
                  <div style={{ background: p.optionB?.color || '#666' }} />
                </div>
                <div className="search-poll-info">
                  <span className="search-poll-title">{p.title}</span>
                  <span className="search-poll-opts">
                    {p.optionA?.text} vs {p.optionB?.text}
                  </span>
                  <span className="search-poll-meta">@{p.authorUsername} · {p.totalVotes || 0} voti</span>
                </div>
                {p.category && (
                  <span className="search-poll-cat">{p.category}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Search;
