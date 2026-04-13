import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  collection, query, orderBy, limit, getDocs,
  where, onSnapshot, Timestamp, startAfter
} from 'firebase/firestore';
import { db } from '../firebase';
import './Home.css';

const PAGE_SIZE = 12;

// Scoring "Per te": più alto = più rilevante per l'utente
function scoreForUser(poll, userCategories) {
  let score = 0;
  const pollTags = [...(poll.hashtags || []), poll.category].filter(Boolean).map(t => t.toLowerCase());
  const userCats = (userCategories || []).map(c => c.toLowerCase());
  // Match categorie
  pollTags.forEach(t => { if (userCats.includes(t)) score += 4; });
  // Engagement
  score += Math.log1p(poll.totalVotes || 0) * 2;
  score += Math.log1p(poll.likesCount || 0);
  // Recency boost
  const ageH = (Date.now() - (poll.createdAt?.toMillis?.() || Date.now())) / 3_600_000;
  if (ageH < 24) score += 3;
  else if (ageH < 72) score += 1;
  // Piccolo rumore per non avere sempre lo stesso ordine
  score += Math.random() * 0.5;
  return score;
}

// Skeleton per le card del feed
function FeedSkeleton() {
  return (
    <div className="feed-grid">
      {[...Array(6)].map((_, i) => (
        <div className="skeleton-poll-card stagger-item" key={i}>
          <div className="skeleton skeleton-color" />
          <div style={{ height: 2, background: 'var(--bg)' }} />
          <div className="skeleton skeleton-color" />
          <div className="skeleton-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="skeleton skeleton-circle" style={{ width: 20, height: 20 }} />
              <div className="skeleton skeleton-text" style={{ width: 80, marginBottom: 0 }} />
            </div>
            <div className="skeleton skeleton-text short" style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Home() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab attivo: 'tutti' | 'seguiti' | 'tendenze'
  const [tab, setTab] = useState('tutti');

  // Se non loggato, forza sempre "tendenze"
  const activeTab = !user && !authLoading ? 'tendenze' : tab;
  // Cache per i tre tab (non per il filtro hashtag)
  const [pollsCache, setPollsCache] = useState({ tutti: null, seguiti: null, tendenze: null });
  // Cursori Firestore e flag "ci sono altri" per ogni tab
  const [lastDocCache, setLastDocCache] = useState({ tutti: null, seguiti: null, tendenze: null });
  const [hasMoreCache, setHasMoreCache] = useState({ tutti: true, seguiti: true, tendenze: true });
  // Risultati per filtro hashtag (non cachati)
  const [tagPolls, setTagPolls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const loadingInitialRef = useRef({ tutti: false, seguiti: false, tendenze: false });
  const sentinelRef = useRef(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Tag attivo dal query param ?tag=
  const activeTag = searchParams.get('tag') || '';

  // Polls da mostrare
  const polls = activeTag
    ? (tagPolls || [])
    : (pollsCache[activeTab] || []);

  // ── Listener notifiche non lette ──
  useEffect(() => {
    if (!user) { setUnreadNotifs(0); return; }
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      where('read', '==', false),
      limit(99)
    );
    const unsub = onSnapshot(q, s => setUnreadNotifs(s.size), () => setUnreadNotifs(0));
    return unsub;
  }, [user?.uid]);

  // ── Listener messaggi non letti ──
  useEffect(() => {
    if (!user) { setUnreadMessages(0); return; }
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, snap => {
      const total = snap.docs.reduce((s, d) => s + (d.data().unreadCounts?.[user.uid] || 0), 0);
      setUnreadMessages(total);
    }, () => setUnreadMessages(0));
    return unsub;
  }, [user?.uid]);

  // ── Invalida cache seguiti quando cambia following ──
  const followingKey = userProfile?.following?.join(',') || '';
  useEffect(() => {
    setPollsCache(prev => ({ ...prev, seguiti: null }));
    setLastDocCache(prev => ({ ...prev, seguiti: null }));
    setHasMoreCache(prev => ({ ...prev, seguiti: true }));
  }, [followingKey]);

  // ── Carica polls per filtro hashtag ──
  useEffect(() => {
    if (!activeTag) { setTagPolls(null); return; }
    setLoading(true);
    setTagPolls(null);

    // Query 1: sondaggi nuovi con campo hashtags
    const qHashtags = query(
      collection(db, 'polls'),
      where('hashtags', 'array-contains', activeTag),
      limit(50)
    );

    // Query 2: sondaggi vecchi con campo category (prova lowercase e con prima lettera maiuscola)
    const categoryVariants = [
      activeTag,
      activeTag.charAt(0).toUpperCase() + activeTag.slice(1)
    ];
    const qCategory = query(
      collection(db, 'polls'),
      where('category', 'in', categoryVariants),
      limit(50)
    );

    Promise.all([getDocs(qHashtags), getDocs(qCategory)])
      .then(([snapH, snapC]) => {
        // Deduplicazione tramite Map su id
        const map = new Map();
        [...snapH.docs, ...snapC.docs].forEach(d => {
          map.set(d.id, { id: d.id, ...d.data() });
        });
        const data = [...map.values()]
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setTagPolls(data);
      })
      .catch(() => setTagPolls([]))
      .finally(() => setLoading(false));
  }, [activeTag]);

  // ── Carica polls per tab ──
  useEffect(() => {
    if (activeTag) return; // filtro hashtag attivo, non caricare tab
    if (activeTab === 'tutti') {
      if (pollsCache.tutti !== null) { setLoading(false); return; }
      loadPolls();
    } else if (activeTab === 'tendenze') {
      if (pollsCache.tendenze !== null) { setLoading(false); return; }
      loadPolls();
    } else if (!authLoading) {
      if (pollsCache.seguiti !== null) { setLoading(false); return; }
      loadPolls();
    }
  }, [activeTab, pollsCache.tutti, pollsCache.seguiti, pollsCache.tendenze, authLoading, activeTag]);

  async function loadPolls(isLoadMore = false) {
    if (isLoadMore) {
      // Aspetta che il caricamento iniziale sia completato (cursore disponibile)
      if (loadingMoreRef.current || !hasMoreCache[activeTab] || !lastDocCache[activeTab]) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      // Evita doppio avvio del caricamento iniziale (race condition con re-render)
      if (loadingInitialRef.current[activeTab]) return;
      loadingInitialRef.current[activeTab] = true;
      setLoading(true);
    }

    try {
      let q;
      const lastDoc = isLoadMore ? lastDocCache[activeTab] : null;

      if (activeTab === 'tendenze') {
        // Tendenze: singola fetch grossa, sort client-side — niente paginazione
        const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        q = query(
          collection(db, 'polls'),
          where('createdAt', '>=', sevenDaysAgo),
          limit(60)
        );
      } else if (activeTab === 'seguiti' && userProfile?.following?.length > 0) {
        const followingSlice = userProfile.following.slice(0, 30);
        const constraints = [
          where('authorId', 'in', followingSlice),
          orderBy('createdAt', 'desc'),
        ];
        if (lastDoc) constraints.push(startAfter(lastDoc));
        constraints.push(limit(PAGE_SIZE));
        q = query(collection(db, 'polls'), ...constraints);
      } else {
        const constraints = [orderBy('createdAt', 'desc')];
        if (lastDoc) constraints.push(startAfter(lastDoc));
        constraints.push(limit(PAGE_SIZE));
        q = query(collection(db, 'polls'), ...constraints);
      }

      const snapshot = await getDocs(q);
      let pollsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filtra poll di profili privati (visibili solo in "seguiti")
      if (activeTab === 'tutti' || activeTab === 'tendenze') {
        pollsData = pollsData.filter(p => !p.authorIsPrivate);
      }

      if (activeTab === 'tendenze') {
        pollsData = pollsData.sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0));
      } else if (activeTab === 'tutti' && user && userProfile?.categories?.length > 0) {
        // Algoritmo "Per te": re-ordina per rilevanza utente
        pollsData = pollsData.sort((a, b) => scoreForUser(b, userProfile.categories) - scoreForUser(a, userProfile.categories));
      }

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
      const hasMore = activeTab !== 'tendenze' && snapshot.docs.length === PAGE_SIZE;

      setLastDocCache(prev => ({ ...prev, [activeTab]: newLastDoc }));
      setHasMoreCache(prev => ({ ...prev, [activeTab]: hasMore }));

      if (isLoadMore) {
        setPollsCache(prev => {
          const existing = prev[activeTab] || [];
          const existingIds = new Set(existing.map(p => p.id));
          const fresh = pollsData.filter(p => !existingIds.has(p.id));
          return { ...prev, [activeTab]: [...existing, ...fresh] };
        });
      } else {
        // Deduplicazione anche per il caricamento iniziale (Strict Mode / doppio fetch)
        const seen = new Set();
        const unique = pollsData.filter(p => !seen.has(p.id) && seen.add(p.id));
        setPollsCache(prev => ({ ...prev, [activeTab]: unique }));
      }
    } catch (err) {
      console.error('[QPe] Errore caricamento poll:', err.code, err.message);
      if (!isLoadMore) setPollsCache(prev => ({ ...prev, [activeTab]: [] }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
      loadingInitialRef.current[activeTab] = false;
    }
  }

  // ── IntersectionObserver per infinite scroll ──
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !activeTag) {
          loadPolls(true);
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeTag, hasMoreCache[activeTab]]);

  function handleTabChange(newTab) {
    // Rimuove eventuale filtro hashtag quando si cambia tab
    if (activeTag) setSearchParams({});
    setTab(newTab);
  }

  function clearTagFilter() {
    setSearchParams({});
    setTagPolls(null);
  }

  // Helper: ottieni hashtag dal poll (o category come fallback)
  function getPollTags(poll) {
    if (poll.hashtags?.length > 0) return poll.hashtags;
    if (poll.category) return [poll.category.toLowerCase()];
    return [];
  }

  return (
    <div className="home page-enter">
      {/* Header */}
      <header className="header">
        <h1 className="header-logo">
          <img src="/qpe_logo.svg" alt="QPe" className="header-logo-img" />
        </h1>
        <div className="header-right">
          {!authLoading && (
            user ? (
              <>
                <Link to="/reel" className="header-icon-btn" title="Reel">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </Link>
                <Link to="/search" className="header-search-btn header-icon-btn" title="Cerca">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </Link>
                <Link to="/messages" className="header-messages header-icon-btn" title="Messaggi">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className="header-notif-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                  )}
                </Link>

                <Link to="/notifications" className="header-notif header-icon-btn" title="Notifiche">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadNotifs > 0 && (
                    <span className="header-notif-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                  )}
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
        {user && (
          <>
            <button className={`feed-tab ${activeTab === 'tutti' && !activeTag ? 'active' : ''}`} onClick={() => handleTabChange('tutti')}>
              Per te
            </button>
            <button className={`feed-tab ${activeTab === 'seguiti' && !activeTag ? 'active' : ''}`} onClick={() => handleTabChange('seguiti')}>
              Seguiti
            </button>
          </>
        )}
        <button className={`feed-tab ${activeTab === 'tendenze' && !activeTag ? 'active' : ''}`} onClick={() => handleTabChange('tendenze')}>
          Tendenze
        </button>
      </div>

      {/* Filtro hashtag attivo */}
      {activeTag && (
        <div className="tag-filter-bar">
          <span className="tag-filter-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            #{activeTag}
          </span>
          <button className="tag-filter-clear" onClick={clearTagFilter}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Feed */}
      <section className="feed">
        {loading ? (
          <FeedSkeleton />
        ) : polls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTag ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
                </svg>
              ) : activeTab === 'seguiti' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              )}
            </div>
            <p className="empty-state-title">
              {activeTag
                ? `Nessun sondaggio con #${activeTag}`
                : activeTab === 'seguiti'
                  ? 'Nessun sondaggio dai tuoi seguiti'
                  : activeTab === 'tendenze'
                    ? 'Nessun trend questa settimana'
                    : 'Nessun sondaggio ancora'}
            </p>
            <p className="empty-state-desc">
              {activeTag
                ? 'Prova con un hashtag diverso'
                : activeTab === 'seguiti'
                  ? 'Segui qualcuno per vedere i suoi sondaggi qui'
                  : activeTab === 'tendenze'
                    ? 'I sondaggi con più voti appariranno qui'
                    : 'Sii il primo a creare un sondaggio!'}
            </p>
            {user && !activeTag && (
              <Link to="/create" className="empty-state-cta">Crea sondaggio</Link>
            )}
            {activeTag && (
              <button className="empty-state-cta" onClick={clearTagFilter}>Rimuovi filtro</button>
            )}
          </div>
        ) : (
          <div className="feed-grid">
            {polls.map((poll, index) => {
              const tags = getPollTags(poll);
              const pollIds = polls.map(p => p.id);
              return (
                <Link
                  to={`/poll/${poll.id}`}
                  state={{ pollIds, currentIndex: index }}
                  key={poll.id}
                  className="poll-card stagger-item"
                  style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}
                >
                  <div className="poll-card-top" style={{
                    backgroundColor: poll.optionA?.color || '#333',
                    ...(poll.optionA?.image && { backgroundImage: `url(${poll.optionA.image})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                  }}>
                    {poll.optionA?.image && <div className="poll-card-img-overlay" />}
                    <span>{poll.optionA?.text}</span>
                  </div>
                  <div className="poll-card-line" />
                  <div className="poll-card-bottom" style={{
                    backgroundColor: poll.optionB?.color || '#666',
                    ...(poll.optionB?.image && { backgroundImage: `url(${poll.optionB.image})`, backgroundSize: 'cover', backgroundPosition: 'center' })
                  }}>
                    {poll.optionB?.image && <div className="poll-card-img-overlay" />}
                    <span>{poll.optionB?.text}</span>
                  </div>
                  <div className="poll-card-footer">
                    <div className="poll-card-user">
                      <div className="poll-card-avatar">{(poll.authorUsername || '?')[0].toUpperCase()}</div>
                      <span className="poll-card-author">{poll.authorUsername}</span>
                    </div>
                    <span className="poll-card-title">{poll.title}</span>
                    {tags.length > 0 && (
                      <div className="poll-card-tags">
                        {tags.slice(0, 2).map(t => (
                          <button
                            key={t}
                            className="poll-card-tag"
                            onClick={e => { e.preventDefault(); setSearchParams({ tag: t }); }}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="poll-card-meta">
                      <span>{poll.totalVotes || 0} voti</span>
                      <span>{poll.likesCount || 0} &#9829;</span>
                      <span title="Visualizzazioni">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline',verticalAlign:'middle',marginRight:2 }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {poll.viewedBy?.length || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Sentinel per infinite scroll + spinner "carica altri" */}
      {!activeTag && !loading && (
        <div ref={sentinelRef} style={{ height: 1 }} />
      )}
      {loadingMore && (
        <div className="feed-load-more-spinner">
          <span className="feed-spinner" />
        </div>
      )}

      {/* FAB - solo desktop, su mobile usa BottomNav */}
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
