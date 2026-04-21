import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment, collection, addDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from '../utils/notifications';
import { getConvId } from '../utils/conversations';
import { useToast } from '../context/ToastContext';
import './PollView.css';

function PollView() {
  const { id } = useParams();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [, setSearchParams] = useSearchParams();

  // Navigazione swipe tra sondaggi
  const pollIds = location.state?.pollIds || [];
  const currentIndex = pollIds.indexOf(id);
  const prevId = currentIndex > 0 ? pollIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < pollIds.length - 1 ? pollIds[currentIndex + 1] : null;

  const goToPoll = useCallback((targetId) => {
    navigate(`/poll/${targetId}`, { state: location.state });
  }, [navigate, location.state]);

  // Swipe touch
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && nextId) goToPoll(nextId);   // swipe sinistra → prossimo
    if (dx > 0 && prevId) goToPoll(prevId);   // swipe destra  → precedente
  }

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
  // Modale inoltro
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardSearch, setForwardSearch] = useState('');
  const [forwardUsers, setForwardUsers] = useState([]);
  const [forwardSearching, setForwardSearching] = useState(false);
  const forwardInputRef = useRef(null);
  const viewRecordedRef = useRef(false);

  // Edit / delete poll (autore)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPoll, setDeletingPoll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editHashtags, setEditHashtags] = useState([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Risposte ai commenti
  const [replyingTo, setReplyingTo] = useState(null);   // commentId a cui stai rispondendo
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replies, setReplies] = useState({});            // { [commentId]: Reply[] }
  const [shownReplies, setShownReplies] = useState(new Set()); // commentId con replies visibili

  // Ascolta il sondaggio in tempo reale (voti, like, visualizzazioni)
  useEffect(() => {
    viewRecordedRef.current = false;
    setLoading(true);
    const docRef = doc(db, 'polls', id);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setPoll({ id: snap.id, ...snap.data() });
      } else {
        setError('Sondaggio non trovato');
      }
      setLoading(false);
    }, (err) => {
      console.error('[QPe] Errore caricamento poll:', err);
      setError('Errore nel caricamento');
      setLoading(false);
    });
    return () => unsub();
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
  }, [user?.uid, poll?.id]);

  // Registra la visualizzazione una sola volta per sessione/utente
  useEffect(() => {
    if (!user || !poll || viewRecordedRef.current) return;
    // L'autore del sondaggio non conta come visualizzazione
    if (user.uid === poll.authorId) return;
    viewRecordedRef.current = true;
    // Se l'utente ha già visto questo sondaggio non scrive su Firestore
    if ((poll.viewedBy || []).includes(user.uid)) return;
    updateDoc(doc(db, 'polls', id), {
      viewedBy: arrayUnion(user.uid)
    }).then(() => {
      setPoll(prev => prev ? ({
        ...prev,
        viewedBy: [...(prev.viewedBy || []), user.uid]
      }) : prev);
    }).catch(() => {});
  }, [user?.uid, poll?.id]);

  // Ricerca utenti nel modale inoltro (prefix matching)
  useEffect(() => {
    if (!showForwardModal) return;
    setTimeout(() => forwardInputRef.current?.focus(), 80);
  }, [showForwardModal]);

  useEffect(() => {
    if (!forwardSearch.trim() || forwardSearch.trim().length < 2) {
      setForwardUsers([]);
      return;
    }
    const t = forwardSearch.trim();
    setForwardSearching(true);
    const termLower = t.toLowerCase();
    const termCap = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();

    const makeQ = (startTerm) => query(
      collection(db, 'users'),
      where('username', '>=', startTerm),
      where('username', '<=', startTerm + '\uf8ff'),
      orderBy('username'),
      limit(8)
    );

    Promise.all([getDocs(makeQ(termLower)), getDocs(makeQ(termCap))])
      .then(([s1, s2]) => {
        const map = new Map();
        [...s1.docs, ...s2.docs].forEach(d => {
          if (d.id !== user?.uid) map.set(d.id, { uid: d.id, ...d.data() });
        });
        setForwardUsers([...map.values()].slice(0, 8));
      })
      .catch(() => setForwardUsers([]))
      .finally(() => setForwardSearching(false));
  }, [forwardSearch]);

  function handleForwardTo(target) {
    const convId = getConvId(user.uid, target.uid);
    const pollData = {
      id,
      title: poll.title,
      optionA: poll.optionA,
      optionB: poll.optionB,
      authorUsername: poll.authorUsername
    };
    setShowForwardModal(false);
    setForwardSearch('');
    navigate(`/messages/${convId}`, {
      state: {
        poll: pollData,
        target: {
          uid: target.uid,
          username: target.username,
          avatar: target.avatar || ''
        }
      }
    });
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

        // onSnapshot aggiorna poll automaticamente — aggiorniamo solo lo stato UI locale
        setHasVoted(false);
        setVotedOption(null);

      } else {
        // --- VOTA ---
        const username = userProfile?.username || user.displayName || 'Anonimo';
        const isFirstVote = !(poll.firstVoters || []).includes(user.uid);
        await updateDoc(pollRef, {
          [`option${choice}.votes`]: increment(1),
          totalVotes: increment(1),
          voters: arrayUnion({ uid: user.uid, username, choice, votedAt: new Date().toISOString() }),
          ...(isFirstVote && { firstVoters: arrayUnion(user.uid) })
        });

        // onSnapshot aggiorna poll automaticamente — aggiorniamo solo lo stato UI locale
        setHasVoted(true);
        setVotedOption(choice);

        // Notifica l'autore solo al primo voto di questo utente su questo sondaggio
        if (poll.authorId && isFirstVote) {
          createNotification(poll.authorId, {
            type: 'vote',
            fromUid: user.uid,
            fromUsername: username,
            pollId: id,
            pollTitle: poll.title
          });
        }
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
        }
        // onSnapshot aggiorna poll automaticamente — aggiorniamo solo lo stato UI locale
        setLiked(false);
      } else {
        const likeObj = { uid: user.uid, username };
        await updateDoc(pollRef, {
          likes: arrayUnion(likeObj),
          likesCount: increment(1)
        });
        // onSnapshot aggiorna poll automaticamente — aggiorniamo solo lo stato UI locale
        setLiked(true);

        // Notifica l'autore del sondaggio
        if (poll.authorId) {
          createNotification(poll.authorId, {
            type: 'like',
            fromUid: user.uid,
            fromUsername: username,
            pollId: id,
            pollTitle: poll.title
          });
        }
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
    if (userProfile?.userMode === 'limited') {
      toast.error('Account in modalità limitata — non puoi commentare per ora.');
      return;
    }
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

      // Notifica l'autore del sondaggio
      if (poll.authorId) {
        createNotification(poll.authorId, {
          type: 'comment',
          fromUid: user.uid,
          fromUsername: username,
          pollId: id,
          pollTitle: poll.title
        });
      }

      // Ascolta la moderazione: se il commento sparisce entro 8s mostra errore
      let commentDeleted = false;
      await new Promise((resolve) => {
        let firstSnap = true;
        const unsub = onSnapshot(docRef, (snap) => {
          if (firstSnap) { firstSnap = false; return; }
          if (!snap.exists()) { commentDeleted = true; unsub(); resolve(); }
        });
        setTimeout(() => { unsub(); resolve(); }, 8000);
      });
      if (commentDeleted) {
        setComments(prev => prev.filter(c => c.id !== docRef.id));
        toast.error('Ops, c\'è stato un problema — Contenuto non consentito dalla community.');
      }
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

  async function loadReplies(commentId) {
    if (replies[commentId]) return; // già caricate
    try {
      const q = query(
        collection(db, 'polls', id, 'comments', commentId, 'replies'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReplies(prev => ({ ...prev, [commentId]: loaded }));
      // Sincronizza il contatore con la realtà (gestisce cancellazioni manuali da console)
      setComments(prev => prev.map(c => {
        if (c.id === commentId && c.repliesCount !== loaded.length) {
          // Aggiorna anche Firestore per correggere il dato alla fonte
          updateDoc(doc(db, 'polls', id, 'comments', commentId), {
            repliesCount: loaded.length
          }).catch(() => {});
          return { ...c, repliesCount: loaded.length };
        }
        return c;
      }));
    } catch (err) {
      console.error('[QPe] Errore caricamento risposte:', err);
      setReplies(prev => ({ ...prev, [commentId]: [] }));
    }
  }

  function toggleReplies(commentId) {
    setShownReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
        loadReplies(commentId);
      }
      return next;
    });
  }

  function startReply(commentId) {
    setReplyingTo(commentId);
    setReplyText('');
    // Carica le risposte esistenti e mostrale
    setShownReplies(prev => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });
    loadReplies(commentId);
  }

  async function handleSendReply(commentId) {
    if (!user || !replyText.trim()) return;
    if (userProfile?.userMode === 'limited') {
      toast.error('Account in modalità limitata — non puoi rispondere per ora.');
      return;
    }
    setSendingReply(true);
    const username = userProfile?.username || user.displayName || 'Anonimo';
    const newReply = {
      uid: user.uid,
      username,
      text: replyText.trim(),
      createdAt: serverTimestamp()
    };
    try {
      const replyRef = await addDoc(
        collection(db, 'polls', id, 'comments', commentId, 'replies'),
        newReply
      );
      // Aggiorna contatore risposte sul commento padre
      await updateDoc(doc(db, 'polls', id, 'comments', commentId), {
        repliesCount: increment(1)
      });
      setReplies(prev => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), { ...newReply, id: replyRef.id, createdAt: new Date() }]
      }));
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, repliesCount: (c.repliesCount || 0) + 1 } : c
      ));
      setReplyText('');
      setReplyingTo(null);

      // Notifica l'autore del commento (non se stai rispondendo a te stesso)
      const parentComment = comments.find(c => c.id === commentId);
      if (parentComment && parentComment.uid !== user.uid) {
        createNotification(parentComment.uid, {
          type: 'comment',
          fromUid: user.uid,
          fromUsername: username,
          pollId: id,
          pollTitle: poll.title
        });
      }

      // Ascolta la moderazione: se la risposta sparisce entro 8s mostra errore
      let replyDeleted = false;
      await new Promise((resolve) => {
        let firstSnap = true;
        const unsub = onSnapshot(replyRef, (snap) => {
          if (firstSnap) { firstSnap = false; return; }
          if (!snap.exists()) { replyDeleted = true; unsub(); resolve(); }
        });
        setTimeout(() => { unsub(); resolve(); }, 8000);
      });
      if (replyDeleted) {
        setReplies(prev => ({
          ...prev,
          [commentId]: (prev[commentId] || []).filter(r => r.id !== replyRef.id)
        }));
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, repliesCount: Math.max(0, (c.repliesCount || 1) - 1) } : c
        ));
        toast.error('Ops, c\'è stato un problema — Contenuto non consentito dalla community.');
      }
    } catch (err) {
      console.error('[QPe] Errore invio risposta:', err);
    } finally {
      setSendingReply(false);
    }
  }

  // Apri modale modifica con dati attuali
  function openEditModal() {
    setEditTitle(poll.title || '');
    setEditHashtags(poll.hashtags?.length > 0 ? [...poll.hashtags] : poll.category ? [poll.category.toLowerCase()] : []);
    setEditTagInput('');
    setShowEditModal(true);
  }

  function addEditTag(raw) {
    const tag = raw.replace(/[#\s]/g, '').toLowerCase().slice(0, 24);
    if (!tag || editHashtags.includes(tag) || editHashtags.length >= 5) return;
    setEditHashtags(prev => [...prev, tag]);
    setEditTagInput('');
  }

  function removeEditTag(tag) {
    setEditHashtags(prev => prev.filter(t => t !== tag));
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) return;
    setSavingEdit(true);
    try {
      await updateDoc(doc(db, 'polls', id), {
        title: editTitle.trim(),
        hashtags: editHashtags,
      });
      setPoll(prev => ({ ...prev, title: editTitle.trim(), hashtags: editHashtags }));
      setShowEditModal(false);
      toast.success('Sondaggio modificato!');
    } catch (err) {
      console.error('[QPe] Errore modifica poll:', err);
      toast.error('Errore nella modifica. Riprova.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeletePoll() {
    setDeletingPoll(true);
    try {
      // Elimina commenti (e loro risposte) prima di eliminare il poll
      const commentsSnap = await getDocs(collection(db, 'polls', id, 'comments'));
      await Promise.all(commentsSnap.docs.map(async (commentDoc) => {
        const repliesSnap = await getDocs(collection(db, 'polls', id, 'comments', commentDoc.id, 'replies'));
        await Promise.all(repliesSnap.docs.map(r => deleteDoc(r.ref)));
        await deleteDoc(commentDoc.ref);
      }));
      // Elimina il sondaggio
      await deleteDoc(doc(db, 'polls', id));
      toast.success('Sondaggio eliminato.');
      navigate('/');
    } catch (err) {
      console.error('[QPe] Errore eliminazione poll:', err);
      toast.error('Errore nell\'eliminazione. Riprova.');
      setDeletingPoll(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="pollview-page page-enter">
        <div className="pollview-loading">Caricamento...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="pollview-page page-enter">
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
    <div className="pollview-page page-enter" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
        <div className="pollview-hashtags">
          {(poll.hashtags?.length > 0
            ? poll.hashtags
            : poll.category ? [poll.category.toLowerCase()] : []
          ).map(tag => (
            <button
              key={tag}
              className="pollview-hashtag"
              onClick={() => navigate(`/?tag=${tag}`)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Frecce navigazione desktop */}
      {prevId && (
        <button className="pollview-nav-arrow pollview-nav-prev" onClick={() => goToPoll(prevId)} title="Sondaggio precedente">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {nextId && (
        <button className="pollview-nav-arrow pollview-nav-next" onClick={() => goToPoll(nextId)} title="Sondaggio successivo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Question */}
      <div className="pollview-question">
        <h1>{poll.title}</h1>
      </div>

      {/* Messaggio autovoto + controlli autore */}
      {isAuthor && (
        <div className="pollview-author-notice">
          <span>Sei il creatore di questo sondaggio — non puoi votare.</span>
          <div className="pollview-author-controls">
            <button className="author-ctrl-btn" onClick={openEditModal} title="Modifica">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Modifica
            </button>
            <button className="author-ctrl-btn danger" onClick={() => setShowDeleteConfirm(true)} title="Elimina">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Elimina
            </button>
          </div>
        </div>
      )}

      {/* Coupé - le due metà */}
      <div className="pollview-coupe">
        <button
          className={`coupe-half coupe-top ${(hasVoted || isAuthor) ? 'voted' : ''} ${votedOption === 'A' ? 'chosen' : ''} ${isAuthor ? 'no-vote author-view' : ''}`}
          style={{
            backgroundColor: poll.optionA.color,
            ...(poll.optionA.image && { backgroundImage: `url(${poll.optionA.image})`, backgroundSize: 'cover', backgroundPosition: 'center' })
          }}
          onClick={() => handleVote('A')}
          disabled={voting || isAuthor}
          title={votedOption === 'A' ? 'Clicca per annullare il voto' : ''}
        >
          {poll.optionA.image && <div className="coupe-img-overlay" />}
          <span className="coupe-text">{poll.optionA.text}</span>
          {(hasVoted || isAuthor) && (
            <div className="coupe-result">
              <div className="coupe-result-bar" style={{ width: `${percA}%` }} />
              <span className="coupe-result-perc">{percA}%</span>
              <span className="coupe-result-votes">{poll.optionA.votes} voti</span>
            </div>
          )}
          {votedOption === 'A' && !isAuthor && <span className="coupe-check">&#10003;</span>}
        </button>

        <div className="coupe-divider">
          <span>VS</span>
        </div>

        <button
          className={`coupe-half coupe-bottom ${(hasVoted || isAuthor) ? 'voted' : ''} ${votedOption === 'B' ? 'chosen' : ''} ${isAuthor ? 'no-vote author-view' : ''}`}
          style={{
            backgroundColor: poll.optionB.color,
            ...(poll.optionB.image && { backgroundImage: `url(${poll.optionB.image})`, backgroundSize: 'cover', backgroundPosition: 'center' })
          }}
          onClick={() => handleVote('B')}
          disabled={voting || isAuthor}
          title={votedOption === 'B' ? 'Clicca per annullare il voto' : ''}
        >
          {poll.optionB.image && <div className="coupe-img-overlay" />}
          <span className="coupe-text">{poll.optionB.text}</span>
          {(hasVoted || isAuthor) && (
            <div className="coupe-result">
              <div className="coupe-result-bar" style={{ width: `${percB}%` }} />
              <span className="coupe-result-perc">{percB}%</span>
              <span className="coupe-result-votes">{poll.optionB.votes} voti</span>
            </div>
          )}
          {votedOption === 'B' && !isAuthor && <span className="coupe-check">&#10003;</span>}
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
            onClick={() => { setShowStats(s => !s); setShowComments(false); }}
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
          <div className="pollview-stat-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>{totalVotes}</span>
          </div>
          <div className="pollview-stat-divider" />
          <div className="pollview-stat-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{poll.likesCount || 0}</span>
          </div>
          <div className="pollview-stat-divider" />
          <div className="pollview-stat-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <span>{poll.viewedBy?.length || 0}</span>
          </div>
        </div>

        {/* Bottone commenti */}
        <button
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={() => {
            if (!showComments && comments.length === 0) loadComments();
            setShowComments(s => !s);
            setShowStats(false);
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{comments.length > 0 ? comments.length : ''}</span>
        </button>

        {/* Inoltra — solo per utenti loggati */}
        {user && (
          <button className="action-btn" onClick={() => setShowForwardModal(true)} title="Inoltra">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 10 20 15 15 20" />
              <path d="M4 4v7a4 4 0 0 0 4 4h12" />
            </svg>
          </button>
        )}
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

      {/* Sezione statistiche — inline per l'autore */}
      {isAuthor && showStats && (
        <div className="pollview-author-stats">
          {/* Header */}
          <div className="stats-header">
            <span className="stats-header-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Statistiche
            </span>
          </div>

          {/* Sommario numeri */}
          <div className="stats-summary">
            <div className="stats-kpi">
              <span className="stats-kpi-num">{poll.viewedBy?.length || 0}</span>
              <span className="stats-kpi-label">Visualizzazioni</span>
            </div>
            <div className="stats-kpi-divider" />
            <div className="stats-kpi">
              <span className="stats-kpi-num">{totalVotes}</span>
              <span className="stats-kpi-label">Voti</span>
            </div>
            <div className="stats-kpi-divider" />
            <div className="stats-kpi">
              <span className="stats-kpi-num">{likers.length}</span>
              <span className="stats-kpi-label">Like</span>
            </div>
          </div>

          <div className="stats-content">
            {/* Votanti per opzione */}
            {voters.length > 0 && (
              <div className="stats-group">
                <div className="stats-group-header">
                  <span className="stats-group-title">Votanti</span>
                  <div className="stats-option-pills">
                    <span className="stats-option-pill" style={{ background: poll.optionA.color }}>
                      {poll.optionA.text} · {votersA.length}
                    </span>
                    <span className="stats-option-pill" style={{ background: poll.optionB.color }}>
                      {poll.optionB.text} · {votersB.length}
                    </span>
                  </div>
                </div>
                <ul className="stats-list">
                  {voters.map((v, i) => (
                    <li key={i} className="stats-item">
                      <div className="stats-avatar">{(v.username || '?')[0].toUpperCase()}</div>
                      <span className="stats-name">@{v.username || v.uid?.slice(0, 8) + '…'}</span>
                      <span className="stats-choice" style={{ background: v.choice === 'A' ? poll.optionA.color : poll.optionB.color }}>
                        {v.choice === 'A' ? poll.optionA.text : poll.optionB.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {voters.length === 0 && (
              <p className="stats-empty-full">Nessun voto ancora.</p>
            )}

            {/* Liker */}
            {likers.length > 0 && (
              <div className="stats-group">
                <div className="stats-group-header">
                  <span className="stats-group-title">Like</span>
                </div>
                <ul className="stats-list">
                  {likers.map((liker, i) => {
                    const likerName = typeof liker === 'object'
                      ? (liker.username || liker.uid?.slice(0, 12) + '…')
                      : liker.slice(0, 12) + '…';
                    return (
                      <li key={i} className="stats-item">
                        <div className="stats-avatar">{likerName[0]?.toUpperCase() || '?'}</div>
                        <span className="stats-name">@{likerName}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--danger)" stroke="none" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modale inoltro sondaggio */}
      {showForwardModal && (
        <div className="forward-overlay" onClick={() => setShowForwardModal(false)}>
          <div className="forward-modal" onClick={e => e.stopPropagation()}>
            <div className="forward-modal-header">
              <h2>Inoltra sondaggio</h2>
              <button className="forward-close" onClick={() => setShowForwardModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="forward-poll-preview">
              <div className="forward-poll-colors">
                <div style={{ background: poll.optionA?.color || '#333' }} />
                <div style={{ background: poll.optionB?.color || '#666' }} />
              </div>
              <span className="forward-poll-title">{poll.title}</span>
            </div>
            <div className="forward-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={forwardInputRef}
                className="forward-search-input"
                type="text"
                placeholder="Cerca un utente..."
                value={forwardSearch}
                onChange={e => setForwardSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="forward-results">
              {forwardSearch.trim().length < 2 ? (
                <p className="forward-hint">Digita almeno 2 caratteri</p>
              ) : forwardSearching ? (
                <p className="forward-hint">Ricerca...</p>
              ) : forwardUsers.length === 0 ? (
                <p className="forward-hint">Nessun utente trovato</p>
              ) : (
                <ul className="forward-user-list">
                  {forwardUsers.map(u => (
                    <li key={u.uid}>
                      <button className="forward-user-btn" onClick={() => handleForwardTo(u)}>
                        <div className="forward-user-avatar">
                          {u.avatar ? <img src={u.avatar} alt="" /> : <span>{(u.username || '?')[0].toUpperCase()}</span>}
                        </div>
                        <span className="forward-user-name">@{u.username}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </li>
                  ))}
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
                const commentReplies = replies[comment.id] || [];
                const repliesVisible = shownReplies.has(comment.id);
                // Se le risposte sono già state caricate usa la lunghezza reale,
                // altrimenti usa il contatore salvato (può essere desincronizzato)
                const repliesCount = replies[comment.id]
                  ? replies[comment.id].length
                  : (comment.repliesCount || 0);

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

                      {/* Azioni commento */}
                      <div className="comment-actions">
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
                          <span className="comment-likes-readonly">♥ {comment.likesCount}</span>
                        )}
                        {user && (
                          <button
                            className="comment-reply-btn"
                            onClick={() => replyingTo === comment.id ? setReplyingTo(null) : startReply(comment.id)}
                          >
                            Rispondi
                          </button>
                        )}
                        {repliesCount > 0 && (
                          <button className="comment-show-replies-btn" onClick={() => toggleReplies(comment.id)}>
                            {repliesVisible
                              ? 'Nascondi risposte'
                              : `${repliesCount} risposta${repliesCount > 1 ? 'e' : ''}`}
                          </button>
                        )}
                      </div>

                      {/* Form risposta inline */}
                      {replyingTo === comment.id && (
                        <div className="reply-form">
                          <div className="comment-avatar reply-avatar">
                            {(userProfile?.username || user?.displayName || '?')[0].toUpperCase()}
                          </div>
                          <input
                            className="reply-input"
                            type="text"
                            placeholder={`Rispondi a @${comment.username}…`}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(comment.id); } }}
                            maxLength={300}
                            disabled={sendingReply}
                            autoFocus
                          />
                          <button
                            className="comment-send"
                            onClick={() => handleSendReply(comment.id)}
                            disabled={sendingReply || !replyText.trim()}
                          >
                            {sendingReply ? '…' : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Lista risposte */}
                      {repliesVisible && commentReplies.length > 0 && (
                        <ul className="replies-list">
                          {commentReplies.map(reply => (
                            <li key={reply.id} className="reply-item">
                              <div className="comment-avatar reply-avatar">
                                {(reply.username || '?')[0].toUpperCase()}
                              </div>
                              <div className="reply-body">
                                <div className="comment-header">
                                  <span className="comment-username">@{reply.username}</span>
                                  {reply.createdAt?.toDate && (
                                    <span className="comment-time">
                                      {reply.createdAt.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                    </span>
                                  )}
                                </div>
                                <p className="comment-text">{reply.text}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      {/* ── Modale MODIFICA ── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifica sondaggio</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-note">Puoi modificare la domanda e gli hashtag. Le opzioni di voto non possono essere cambiate.</p>
              <div className="modal-field">
                <label>Domanda</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  maxLength={120}
                  autoFocus
                />
                <span className="modal-char-count">{editTitle.length}/120</span>
              </div>
              <div className="modal-field">
                <label>Hashtag</label>
                <div className="modal-tags-box">
                  {editHashtags.map(tag => (
                    <span key={tag} className="modal-tag-chip">
                      #{tag}
                      <button type="button" onClick={() => removeEditTag(tag)}>×</button>
                    </span>
                  ))}
                  {editHashtags.length < 5 && (
                    <input
                      className="modal-tag-input"
                      type="text"
                      placeholder="Aggiungi tag…"
                      value={editTagInput}
                      onChange={e => setEditTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEditTag(editTagInput); }
                        if (e.key === 'Backspace' && !editTagInput && editHashtags.length > 0) removeEditTag(editHashtags[editHashtags.length - 1]);
                      }}
                      onBlur={() => editTagInput.trim() && addEditTag(editTagInput)}
                      maxLength={25}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setShowEditModal(false)}>Annulla</button>
              <button
                className="modal-btn-primary"
                onClick={handleSaveEdit}
                disabled={savingEdit || !editTitle.trim()}
              >
                {savingEdit ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale ELIMINA ── */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => !deletingPoll && setShowDeleteConfirm(false)}>
          <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Elimina sondaggio</h3>
            </div>
            <div className="modal-body">
              <p className="modal-delete-warning">
                Questa azione è <strong>irreversibile</strong>. Il sondaggio, tutti i voti e i commenti verranno eliminati definitivamente.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingPoll}
              >
                Annulla
              </button>
              <button
                className="modal-btn-danger"
                onClick={handleDeletePoll}
                disabled={deletingPoll}
              >
                {deletingPoll ? 'Eliminazione...' : 'Sì, elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PollView;
