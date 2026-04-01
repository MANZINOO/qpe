import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import './Home.css';

function Home() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [pollsCache, setPollsCache] = useState({ tutti: null, seguiti: null });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tutti'); // tutti | seguiti

  const polls = pollsCache[tab] || [];

  // Per "tutti": carica subito senza aspettare auth
  // Per "seguiti": aspetta che auth sia pronto e che ci sia un profilo
  // Usa la cache per non ricaricare se i dati ci sono già
  const followingKey = userProfile?.following?.join(',') || '';

  // Invalida la cache "seguiti" quando cambia la lista following
  useEffect(() => {
    setPollsCache(prev => ({ ...prev, seguiti: null }));
  }, [followingKey]);

  useEffect(() => {
    if (tab === 'tutti') {
      if (pollsCache.tutti !== null) { setLoading(false); return; }
      loadPolls();
    } else if (!authLoading) {
      if (pollsCache.seguiti !== null) { setLoading(false); return; }
      loadPolls();
    }
  }, [tab, pollsCache.tutti, pollsCache.seguiti, authLoading]);

  async function loadPolls() {
    setLoading(true);
    try {
      let q;
      if (tab === 'seguiti' && userProfile?.following?.length > 0) {
        // Firestore 'in' supporta max 30 items
        const followingSlice = userProfile.following.slice(0, 30);
        q = query(
          collection(db, 'polls'),
          where('authorId', 'in', followingSlice),
          orderBy('createdAt', 'desc'),
          limit(30)
        );
      } else {
        q = query(
          collection(db, 'polls'),
          orderBy('createdAt', 'desc'),
          limit(30)
        );
      }

      const snapshot = await getDocs(q);
      console.log(`[QPe] Feed "${tab}": ${snapshot.docs.length} sondaggi trovati`, snapshot.metadata.fromCache ? '(dalla cache)' : '(dal server)');
      const pollsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPollsCache(prev => ({ ...prev, [tab]: pollsData }));
    } catch (err) {
      console.error('[QPe] Errore caricamento poll:', err.code, err.message);
      setPollsCache(prev => ({ ...prev, [tab]: [] }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <h1 className="header-logo">
          <span className="logo-qp">qp</span>
          <span className="logo-accent">e</span>
        </h1>
        <div className="header-right">
          {!authLoading && (
            user ? (
              <>
                <Link to="/create" className="header-create" title="Crea sondaggio">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </Link>
                <Link to="/profile" className="header-avatar-link">
                  <div className="header-avatar">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="" />
                    ) : (
                      <span>{(userProfile?.username || user.displayName || '?')[0].toUpperCase()}</span>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/login" className="header-login">Accedi</Link>
            )
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${tab === 'tutti' ? 'active' : ''}`}
          onClick={() => setTab('tutti')}
        >
          Per te
        </button>
        <button
          className={`feed-tab ${tab === 'seguiti' ? 'active' : ''}`}
          onClick={() => setTab('seguiti')}
        >
          Seguiti
        </button>
      </div>

      {/* Feed */}
      <section className="feed">
        {loading ? (
          <div className="feed-loading">Caricamento...</div>
        ) : polls.length === 0 ? (
          <div className="feed-empty">
            <p>
              {tab === 'seguiti'
                ? 'Nessun sondaggio dai tuoi seguiti.'
                : 'Nessun sondaggio ancora. Sii il primo!'}
            </p>
            {user && (
              <Link to="/create" className="feed-empty-cta">
                Crea il primo sondaggio
              </Link>
            )}
          </div>
        ) : (
          <div className="feed-grid">
            {polls.map(poll => (
              <Link to={`/poll/${poll.id}`} key={poll.id} className="poll-card">
                <div className="poll-card-top" style={{ backgroundColor: poll.optionA?.color || '#333' }}>
                  <span>{poll.optionA?.text}</span>
                </div>
                <div className="poll-card-line" />
                <div className="poll-card-bottom" style={{ backgroundColor: poll.optionB?.color || '#666' }}>
                  <span>{poll.optionB?.text}</span>
                </div>
                <div className="poll-card-footer">
                  <div className="poll-card-user">
                    <div className="poll-card-avatar">{(poll.authorUsername || '?')[0].toUpperCase()}</div>
                    <span className="poll-card-author">{poll.authorUsername}</span>
                  </div>
                  <span className="poll-card-title">{poll.title}</span>
                  <div className="poll-card-meta">
                    <span>{poll.totalVotes || 0} voti</span>
                    <span>{poll.likesCount || 0} &#9829;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FAB - create poll */}
      {user && (
        <Link to="/create" className="fab" title="Crea sondaggio">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default Home;
