import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './PollView.css';

function PollView() {
  const { id } = useParams();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState(null);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Carica il sondaggio UNA sola volta quando cambia l'id
  useEffect(() => {
    loadPoll();
  }, [id]);

  // Quando l'utente diventa disponibile (auth asincrono), aggiorna lo stato voto/like
  // senza ricaricare il poll da Firestore
  useEffect(() => {
    if (!user || !poll) return;
    if (poll.voters) {
      const voterEntry = poll.voters.find(v => v.uid === user.uid);
      if (voterEntry) {
        setHasVoted(true);
        setVotedOption(voterEntry.choice);
      }
    }
    if (poll.likes?.some(l => (typeof l === 'object' ? l.uid : l) === user.uid)) {
      setLiked(true);
    }
  }, [user?.uid, poll]);

  async function loadPoll() {
    try {
      const docRef = doc(db, 'polls', id);
      const docSnap = await getDoc(docRef);
      console.log(`[QPe] PollView ${id}: exists=${docSnap.exists()}`, docSnap.metadata.fromCache ? '(dalla cache)' : '(dal server)');
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setPoll(data);
      } else {
        setError('Sondaggio non trovato');
      }
    } catch (err) {
      console.error('[QPe] Errore caricamento poll:', err);
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(choice) {
    if (!user) { navigate('/login'); return; }
    if (voting || isAuthor) return;

    setVoting(true);
    try {
      const pollRef = doc(db, 'polls', id);

      if (hasVoted) {
        // --- ANNULLA VOTO ---
        // arrayRemove non funziona su oggetti con votedAt variabile,
        // quindi leggiamo, filtriamo e riscriviamo
        const snap = await getDoc(pollRef);
        if (!snap.exists()) return;
        const data = snap.data();

        const newVoters = (data.voters || []).filter(v => v.uid !== user.uid);
        const removedVote = votedOption; // 'A' o 'B'

        await updateDoc(pollRef, {
          voters: newVoters,
          totalVotes: increment(-1),
          [`option${removedVote}.votes`]: increment(-1)
        });

        setPoll(prev => ({
          ...prev,
          voters: newVoters,
          optionA: { ...prev.optionA, votes: prev.optionA.votes - (removedVote === 'A' ? 1 : 0) },
          optionB: { ...prev.optionB, votes: prev.optionB.votes - (removedVote === 'B' ? 1 : 0) },
          totalVotes: (prev.totalVotes || 1) - 1
        }));
        setHasVoted(false);
        setVotedOption(null);

      } else {
        // --- VOTA ---
        const username = userProfile?.username || user.displayName || 'Anonimo';
        await updateDoc(pollRef, {
          [`option${choice}.votes`]: increment(1),
          totalVotes: increment(1),
          voters: arrayUnion({ uid: user.uid, username, choice, votedAt: new Date().toISOString() })
        });

        setPoll(prev => ({
          ...prev,
          optionA: { ...prev.optionA, votes: prev.optionA.votes + (choice === 'A' ? 1 : 0) },
          optionB: { ...prev.optionB, votes: prev.optionB.votes + (choice === 'B' ? 1 : 0) },
          totalVotes: (prev.totalVotes || 0) + 1,
          voters: [...(prev.voters || []), { uid: user.uid, username, choice }]
        }));
        setHasVoted(true);
        setVotedOption(choice);
      }
    } catch (err) {
      console.error('[QPe] Errore voto:', err);
      setError('Errore nel voto. Riprova.');
    } finally {
      setVoting(false);
    }
  }

  async function handleLike() {
    if (!user) { navigate('/login'); return; }
    if (isAuthor) return; // non puoi mettere like al tuo sondaggio

    const username = userProfile?.username || user.displayName || 'Anonimo';
    try {
      const pollRef = doc(db, 'polls', id);
      if (liked) {
        const snap = await getDoc(pollRef);
        if (snap.exists()) {
          const data = snap.data();
          const newLikes = (data.likes || []).filter(l =>
            (typeof l === 'object' ? l.uid : l) !== user.uid
          );
          await updateDoc(pollRef, { likes: newLikes, likesCount: newLikes.length });
          setPoll(prev => ({ ...prev, likes: newLikes, likesCount: newLikes.length }));
        }
        setLiked(false);
      } else {
        const likeObj = { uid: user.uid, username };
        await updateDoc(pollRef, {
          likes: arrayUnion(likeObj),
          likesCount: increment(1)
        });
        setPoll(prev => ({
          ...prev,
          likes: [...(prev.likes || []), likeObj],
          likesCount: (prev.likesCount || 0) + 1
        }));
        setLiked(true);
      }
    } catch (err) {
      console.error('[QPe] Errore like:', err);
    }
  }

  async function loadComments() {
    try {
      const q = query(
        collection(db, 'polls', id, 'comments'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[QPe] Errore caricamento commenti:', err);
    }
  }

  async function handleSendComment(e) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;

    setSendingComment(true);
    const username = userProfile?.username || user.displayName || 'Anonimo';
    const newComment = {
      uid: user.uid,
      username,
      text: commentText.trim(),
      likes: [],
      likesCount: 0,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'polls', id, 'comments'), newComment);
      setComments(prev => [...prev, { ...newComment, id: docRef.id, createdAt: new Date() }]);
      setCommentText('');
    } catch (err) {
      console.error('[QPe] Errore invio commento:', err);
    } finally {
      setSendingComment(false);
    }
  }

  async function handleCommentLike(commentId) {
    if (!user) { navigate('/login'); return; }
    const comment = comments.find(c => c.id === commentId);
    if (comment?.uid === user.uid) return; // non puoi mettere like al tuo commento
    if (!comment) return;

    const commentRef = doc(db, 'polls', id, 'comments', commentId);
    const alreadyLiked = (comment.likes || []).includes(user.uid);

    try {
      if (alreadyLiked) {
        await updateDoc(commentRef, {
          likes: arrayRemove(user.uid),
          likesCount: increment(-1)
        });
        setComments(prev => prev.map(c => c.id === commentId
          ? { ...c, likes: c.likes.filter(u => u !== user.uid), likesCount: (c.likesCount || 1) - 1 }
          : c
        ));
      } else {
        await updateDoc(commentRef, {
          likes: arrayUnion(user.uid),
          likesCount: increment(1)
        });
        setComments(prev => prev.map(c => c.id === commentId
          ? { ...c, likes: [...(c.likes || []), user.uid], likesCount: (c.likesCount || 0) + 1 }
          : c
        ));
      }
    } catch (err) {
      console.error('[QPe] Errore like commento:', err);
    }
  }

  if (loading) {
    return (
      <div className="pollview-page">
        <div className="pollview-loading">Caricamento...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="pollview-page">
        <div className="pollview-error">
          <p>{error || 'Sondaggio non trovato'}</p>
          <Link to="/">Torna alla home</Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.uid === poll.authorId;
  const totalVotes = (poll.optionA?.votes || 0) + (poll.optionB?.votes || 0);
  const percA = totalVotes > 0 ? Math.round((poll.optionA.votes / totalVotes) * 100) : 50;
  const percB = totalVotes > 0 ? 100 - percA : 50;

  // Per l'autore: lista votanti e liker
  const voters = poll.voters || [];
  const votersA = voters.filter(v => v.choice === 'A');
  const votersB = voters.filter(v => v.choice === 'B');
  const likers = poll.likes || [];

  return (
    <div className="pollview-page">
      {/* Header */}
      <div className="pollview-header">
        <Link to="/" className="pollview-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <Link to={`/u/${poll.authorId}`} className="pollview-author">
          <div className="pollview-author-avatar">
            {poll.authorAvatar ? (
              <img src={poll.authorAvatar} alt="" />
            ) : (
              <span>{(poll.authorUsername || '?')[0].toUpperCase()}</span>
            )}
          </div>
          <span className="pollview-author-name">@{poll.authorUsername}</span>
        </Link>
        <div className="pollview-category">{poll.category}</div>
      </div>

      {/* Question */}
      <div className="pollview-question">
        <h1>{poll.title}</h1>
      </div>

      {/* Messaggio autovoto */}
      {isAuthor && (
        <div className="pollview-author-notice">
          Sei il creatore di questo sondaggio — non puoi votare.
        </div>
      )}

      {/* Coupé - le due metà */}
      <div className="pollview-coupe">
        <button
          className={`coupe-half coupe-top ${hasVoted ? 'voted' : ''} ${votedOption === 'A' ? 'chosen' : ''} ${isAuthor ? 'no-vote' : ''}`}
          style={{ backgroundColor: poll.optionA.color }}
          onClick={() => handleVote('A')}
          disabled={voting || isAuthor}
          title={votedOption === 'A' ? 'Clicca per annullare il voto' : ''}
        >
          <span className="coupe-text">{poll.optionA.text}</span>
          {hasVoted && (
            <div className="coupe-result">
              <div className="coupe-result-bar" style={{ width: `${percA}%` }} />
              <span className="coupe-result-perc">{percA}%</span>
              <span className="coupe-result-votes">{poll.optionA.votes} voti</span>
            </div>
          )}
          {votedOption === 'A' && <span className="coupe-check">&#10003;</span>}
        </button>

        <div className="coupe-divider">
          <span>VS</span>
        </div>

        <button
          className={`coupe-half coupe-bottom ${hasVoted ? 'voted' : ''} ${votedOption === 'B' ? 'chosen' : ''} ${isAuthor ? 'no-vote' : ''}`}
          style={{ backgroundColor: poll.optionB.color }}
          onClick={() => handleVote('B')}
          disabled={voting || isAuthor}
          title={votedOption === 'B' ? 'Clicca per annullare il voto' : ''}
        >
          <span className="coupe-text">{poll.optionB.text}</span>
          {hasVoted && (
            <div className="coupe-result">
              <div className="coupe-result-bar" style={{ width: `${percB}%` }} />
              <span className="coupe-result-perc">{percB}%</span>
              <span className="coupe-result-votes">{poll.optionB.votes} voti</span>
            </div>
          )}
          {votedOption === 'B' && <span className="coupe-check">&#10003;</span>}
        </button>
      </div>

      {/* Hint annullamento voto */}
      {hasVoted && !isAuthor && (
        <div className="pollview-undo-hint">
          Hai votato <strong>{votedOption === 'A' ? poll.optionA.text : poll.optionB.text}</strong> — clicca di nuovo per annullare
        </div>
      )}

      {/* Actions bar */}
      <div className="pollview-actions">
        {isAuthor ? (
          /* Per l'autore: bottone statistiche al posto del like */
          <button
            className={`action-btn stats-btn ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats(s => !s)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Statistiche</span>
          </button>
        ) : (
          <button
            className={`action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            title={liked ? 'Rimuovi like' : 'Metti like'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'var(--danger)' : 'none'} stroke={liked ? 'var(--danger)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{poll.likesCount || 0}</span>
          </button>
        )}

        <div className="pollview-stats">
          <span>{totalVotes} voti totali</span>
          {!isAuthor && <span>{poll.likesCount || 0} like</span>}
        </div>

        {/* Bottone commenti */}
        <button
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={() => {
            if (!showComments && comments.length === 0) loadComments();
            setShowComments(s => !s);
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{comments.length > 0 ? comments.length : ''}</span>
        </button>

        <button className="action-btn" onClick={() => {
          if (navigator.share) {
            navigator.share({ title: poll.title, url: window.location.href });
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>

      {!user && (
        <div className="pollview-login-prompt">
          <Link to="/login">Accedi</Link> per votare e interagire
        </div>
      )}

      {/* Sezione statistiche — inline per l'autore, sotto la actions bar */}
      {isAuthor && showStats && (
        <div className="pollview-author-stats">
          <div className="stats-content">
            {/* Votanti */}
            <div className="stats-group">
              <h3>
                Votanti ({voters.length})
                {totalVotes > 0 && (
                  <span className="stats-split">
                    &nbsp;— {poll.optionA.text}: {votersA.length} | {poll.optionB.text}: {votersB.length}
                  </span>
                )}
              </h3>
              {voters.length === 0 ? (
                <p className="stats-empty">Nessun voto ancora.</p>
              ) : (
                <ul className="stats-list">
                  {voters.map((v, i) => (
                    <li key={i} className="stats-item">
                      <div className="stats-avatar">{(v.username || v.uid || '?')[0].toUpperCase()}</div>
                      <span className="stats-name">@{v.username || v.uid?.slice(0, 8) + '…'}</span>
                      <span
                        className="stats-choice"
                        style={{ backgroundColor: v.choice === 'A' ? poll.optionA.color : poll.optionB.color }}
                      >
                        {v.choice === 'A' ? poll.optionA.text : poll.optionB.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Liker */}
            <div className="stats-group">
              <h3>Like ({likers.length})</h3>
              {likers.length === 0 ? (
                <p className="stats-empty">Nessun like ancora.</p>
              ) : (
                <ul className="stats-list">
                  {likers.map((liker, i) => {
                    const likerName = typeof liker === 'object'
                      ? (liker.username || liker.uid?.slice(0, 12) + '…')
                      : liker.slice(0, 12) + '…';
                    return (
                      <li key={i} className="stats-item">
                        <div className="stats-avatar">{likerName[0]?.toUpperCase() || '?'}</div>
                        <span className="stats-name">@{likerName}</span>
                        <span className="stats-heart">♥</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sezione commenti */}
      {showComments && (
        <div className="pollview-comments">
          <h3 className="comments-title">Commenti {comments.length > 0 && `(${comments.length})`}</h3>

          {/* Form invio commento */}
          {user ? (
            <form className="comment-form" onSubmit={handleSendComment}>
              <div className="comment-input-row">
                <div className="comment-avatar">{(userProfile?.username || user.displayName || '?')[0].toUpperCase()}</div>
                <input
                  className="comment-input"
                  type="text"
                  placeholder="Scrivi un commento..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  maxLength={300}
                  disabled={sendingComment}
                />
                <button
                  className="comment-send"
                  type="submit"
                  disabled={sendingComment || !commentText.trim()}
                >
                  {sendingComment ? '...' : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <p className="comments-login"><Link to="/login">Accedi</Link> per commentare</p>
          )}

          {/* Lista commenti */}
          {comments.length === 0 ? (
            <p className="comments-empty">Nessun commento ancora. Sii il primo!</p>
          ) : (
            <ul className="comments-list">
              {comments.map(comment => {
                const alreadyLiked = (comment.likes || []).includes(user?.uid);
                return (
                  <li key={comment.id} className="comment-item">
                    <div className="comment-avatar">{(comment.username || '?')[0].toUpperCase()}</div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-username">@{comment.username}</span>
                        {comment.createdAt?.toDate && (
                          <span className="comment-time">
                            {comment.createdAt.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      {comment.uid !== user?.uid && (
                        <button
                          className={`comment-like-btn ${alreadyLiked ? 'liked' : ''}`}
                          onClick={() => handleCommentLike(comment.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={alreadyLiked ? 'var(--danger)' : 'none'} stroke={alreadyLiked ? 'var(--danger)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span>{comment.likesCount || 0}</span>
                        </button>
                      )}
                      {comment.uid === user?.uid && comment.likesCount > 0 && (
                        <span className="comment-likes-readonly">
                          ♥ {comment.likesCount}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default PollView;
