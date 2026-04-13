import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  collection, query, orderBy, limit, getDocs,
  startAfter, doc, updateDoc, arrayUnion, increment
} from 'firebase/firestore';
import { db } from '../firebase';
import './ReelView.css';

const PAGE_SIZE = 10;

function ReelCard({ poll, votedChoice, onVote, navigate }) {
  const totalVotes = (poll.optionA?.votes || 0) + (poll.optionB?.votes || 0);
  const percA = totalVotes > 0 ? Math.round((poll.optionA.votes / totalVotes) * 100) : 50;
  const percB = 100 - percA;

  return (
    <div className="reel-card">
      {/* Opzione A */}
      <div
        className={`reel-half reel-half-a ${votedChoice ? 'voted' : ''} ${votedChoice === 'A' ? 'chosen' : ''}`}
        style={{
          backgroundColor: poll.optionA?.color || '#333',
          ...(poll.optionA?.image && { backgroundImage: `url(${poll.optionA.image})`, backgroundSize: 'cover', backgroundPosition: 'center' })
        }}
        onClick={() => !votedChoice && onVote(poll, 'A')}
      >
        {poll.optionA?.image && <div className="reel-img-overlay" />}
        {votedChoice ? (
          <div className="reel-result">
            <span className="reel-result-perc">{percA}%</span>
            <span className="reel-result-text">{poll.optionA?.text}</span>
            {votedChoice === 'A' && <span className="reel-chosen-mark">✓ Il tuo voto</span>}
          </div>
        ) : (
          <span className="reel-option-text">{poll.optionA?.text}</span>
        )}
      </div>

      {/* Divider con titolo */}
      <div className="reel-divider">
        <span className="reel-title">{poll.title}</span>
      </div>

      {/* Opzione B */}
      <div
        className={`reel-half reel-half-b ${votedChoice ? 'voted' : ''} ${votedChoice === 'B' ? 'chosen' : ''}`}
        style={{
          backgroundColor: poll.optionB?.color || '#666',
          ...(poll.optionB?.image && { backgroundImage: `url(${poll.optionB.image})`, backgroundSize: 'cover', backgroundPosition: 'center' })
        }}
        onClick={() => !votedChoice && onVote(poll, 'B')}
      >
        {poll.optionB?.image && <div className="reel-img-overlay" />}
        {votedChoice ? (
          <div className="reel-result">
            <span className="reel-result-perc">{percB}%</span>
            <span className="reel-result-text">{poll.optionB?.text}</span>
            {votedChoice === 'B' && <span className="reel-chosen-mark">✓ Il tuo voto</span>}
          </div>
        ) : (
          <span className="reel-option-text">{poll.optionB?.text}</span>
        )}
      </div>

      {/* Footer */}
      <div className="reel-footer">
        <Link to={`/u/${poll.authorId}`} className="reel-author" onClick={e => e.stopPropagation()}>
          <div className="reel-avatar">
            {poll.authorAvatar
              ? <img src={poll.authorAvatar} alt="" />
              : <span>{(poll.authorUsername || '?')[0].toUpperCase()}</span>
            }
          </div>
          <span>@{poll.authorUsername}</span>
        </Link>
        <div className="reel-stats">
          <span>{poll.totalVotes || 0} voti</span>
          <Link to={`/poll/${poll.id}`} className="reel-detail-btn" onClick={e => e.stopPropagation()}>
            Dettagli
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReelView() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({}); // { pollId: 'A' | 'B' }
  const lastDocRef = useRef(null);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => { loadPolls(); }, []);

  // IntersectionObserver per caricare altri poll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
        loadPolls(true);
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [polls.length]);

  async function loadPolls(isMore = false) {
    if (loadingMoreRef.current || (!isMore && !loading)) return;
    if (isMore && !hasMoreRef.current) return;
    loadingMoreRef.current = true;

    try {
      const constraints = [orderBy('createdAt', 'desc')];
      if (isMore && lastDocRef.current) constraints.push(startAfter(lastDocRef.current));
      constraints.push(limit(PAGE_SIZE));

      const snap = await getDocs(query(collection(db, 'polls'), ...constraints));
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filtra profili privati
      data = data.filter(p => !p.authorIsPrivate);

      lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
      hasMoreRef.current = snap.docs.length === PAGE_SIZE;

      if (isMore) {
        setPolls(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...data.filter(p => !ids.has(p.id))];
        });
      } else {
        setPolls(data);
        // Pre-carica voti dell'utente
        if (user) {
          const votedMap = {};
          data.forEach(p => {
            const entry = p.voters?.find(v => v.uid === user.uid);
            if (entry) votedMap[p.id] = entry.choice;
          });
          setVotes(votedMap);
        }
      }
    } catch (err) {
      console.error('[QPe] Reel load error:', err);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }

  async function handleVote(poll, choice) {
    if (!user) { navigate('/login'); return; }
    if (votes[poll.id]) return;

    const username = userProfile?.username || user.displayName || 'anonimo';
    // Ottimistico
    setVotes(prev => ({ ...prev, [poll.id]: choice }));
    setPolls(prev => prev.map(p => {
      if (p.id !== poll.id) return p;
      const key = choice === 'A' ? 'optionA' : 'optionB';
      return {
        ...p,
        totalVotes: (p.totalVotes || 0) + 1,
        [key]: { ...p[key], votes: (p[key]?.votes || 0) + 1 },
        voters: [...(p.voters || []), { uid: user.uid, username, choice }],
      };
    }));

    try {
      const pollRef = doc(db, 'polls', poll.id);
      const voteField = choice === 'A' ? 'optionA.votes' : 'optionB.votes';
      await updateDoc(pollRef, {
        [voteField]: increment(1),
        totalVotes: increment(1),
        voters: arrayUnion({ uid: user.uid, username, choice, votedAt: new Date().toISOString() }),
      });
    } catch (err) {
      // Rollback ottimistico
      setVotes(prev => { const n = { ...prev }; delete n[poll.id]; return n; });
      console.error('[QPe] Vote error:', err);
    }
  }

  if (loading) {
    return (
      <div className="reel-loading">
        <div className="reel-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="reel-page">
      {/* Header fisso */}
      <div className="reel-header">
        <button className="reel-back-btn" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="reel-header-title">Reel</span>
        {!user && (
          <Link to="/login" className="reel-login-btn">Accedi per votare</Link>
        )}
      </div>

      {/* Scroll container */}
      <div className="reel-scroll">
        {polls.length === 0 ? (
          <div className="reel-empty">
            <p>Nessun sondaggio disponibile</p>
            <button onClick={() => navigate('/')}>Torna alla home</button>
          </div>
        ) : (
          polls.map(poll => (
            <ReelCard
              key={poll.id}
              poll={poll}
              votedChoice={votes[poll.id]}
              onVote={handleVote}
              navigate={navigate}
            />
          ))
        )}
        {/* Sentinel per caricare altri */}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {hasMoreRef.current && (
          <div className="reel-load-more">
            <div className="reel-loading-spinner small" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReelView;
