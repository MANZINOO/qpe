import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConvId } from '../utils/conversations';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './UserProfile.css';

function UserProfile() {
  const { uid } = useParams();
  const { user, userProfile, followUser, unfollowUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user && user.uid === uid;
  const isFollowing = userProfile?.following?.includes(uid) || false;
  // Richiesta di follow inviata ma non ancora accettata
  const hasPendingRequest = !isFollowing && profile?.followRequests?.includes(user?.uid);

  useEffect(() => {
    loadProfile();
  }, [uid]);

  async function loadProfile() {
    setLoading(true);
    try {
      // Carica profilo utente
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        setProfile({ uid: docSnap.id, ...docSnap.data() });
      }

      // Carica i sondaggi dell'utente
      const q = query(
        collection(db, 'polls'),
        where('authorId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setPolls(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.warn('[QPe] Errore caricamento profilo:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMessage() {
    if (!user) { navigate('/login'); return; }
    const convId = getConvId(user.uid, uid);
    navigate(`/messages/${convId}`, {
      state: {
        target: {
          uid,
          username: profile?.username || 'Utente',
          avatar: profile?.avatar || ''
        }
      }
    });
  }

  async function handleFollow() {
    if (!user || isOwnProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(uid);
        setProfile(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(f => f !== user.uid)
        }));
      } else {
        await followUser(uid);
        setProfile(prev => {
          const followers = prev.followers || [];
          // Evita duplicati nel contatore locale
          if (followers.includes(user.uid)) return prev;
          return { ...prev, followers: [...followers, user.uid] };
        });
      }
    } catch (err) {
      console.warn('[QPe] Errore follow/unfollow:', err.message);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="userprofile-page page-enter">
        <div className="userprofile-header">
          <button onClick={() => navigate(-1)} className="userprofile-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="skeleton skeleton-text" style={{ width: 100, margin: 0 }} />
          <div style={{ width: 20 }} />
        </div>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div className="skeleton skeleton-circle" style={{ width: 80, height: 80, margin: '0 auto 14px' }} />
          <div className="skeleton skeleton-text" style={{ width: 140, margin: '0 auto 8px' }} />
          <div className="skeleton skeleton-text short" style={{ margin: '0 auto 16px', width: 200 }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
            <div className="skeleton skeleton-text" style={{ width: 50, marginBottom: 0 }} />
            <div className="skeleton skeleton-text" style={{ width: 50, marginBottom: 0 }} />
            <div className="skeleton skeleton-text" style={{ width: 50, marginBottom: 0 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="userprofile-page page-enter">
        <div className="userprofile-error">
          <p>Utente non trovato</p>
          <Link to="/">Torna alla home</Link>
        </div>
      </div>
    );
  }

  const displayName = profile.username || 'Utente';
  const initial = displayName[0]?.toUpperCase() || '?';
  const followersCount = (profile.followers || []).length;
  const followingCount = (profile.following || []).length;

  return (
    <div className="userprofile-page page-enter">
      {/* Header */}
      <div className="userprofile-header">
        <button onClick={() => navigate(-1)} className="userprofile-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="userprofile-header-name">
          @{displayName}
          {profile?.isPrivate && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 5, opacity: 0.6, verticalAlign: 'middle' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </span>
        <div style={{ width: 20 }} />
      </div>

      {/* Profilo */}
      <div className="userprofile-info">
        <div className="userprofile-avatar">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <div className="userprofile-details">
          <h1 className="userprofile-name">@{displayName}</h1>
          {profile.bio && <p className="userprofile-bio">{profile.bio}</p>}
        </div>

        <div className="userprofile-stats">
          <div className="userprofile-stat">
            <span className="userprofile-stat-num">{polls.length}</span>
            <span className="userprofile-stat-label">Sondaggi</span>
          </div>
          <div className="userprofile-stat">
            <span className="userprofile-stat-num">{followersCount}</span>
            <span className="userprofile-stat-label">Follower</span>
          </div>
          <div className="userprofile-stat">
            <span className="userprofile-stat-num">{followingCount}</span>
            <span className="userprofile-stat-label">Seguiti</span>
          </div>
        </div>

        {/* Pulsanti azione */}
        <div className="userprofile-action">
          {isOwnProfile ? (
            <Link to="/settings" className="userprofile-btn edit">Modifica profilo</Link>
          ) : user ? (
            <>
              <button
                className={`userprofile-btn ${isFollowing ? 'following' : hasPendingRequest ? 'pending' : 'follow'}`}
                onClick={handleFollow}
                disabled={followLoading || !userProfile}
              >
                {followLoading || !userProfile
                  ? '...'
                  : isFollowing
                    ? 'Segui già'
                    : hasPendingRequest
                      ? 'Richiesta inviata'
                      : profile?.isPrivate ? 'Richiedi' : 'Segui'}
              </button>
              <button className="userprofile-btn message" onClick={handleMessage}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Messaggio
              </button>
            </>
          ) : (
            <Link to="/login" className="userprofile-btn follow">Accedi per seguire</Link>
          )}
        </div>

        {/* Categorie */}
        {profile.categories?.length > 0 && (
          <div className="userprofile-categories">
            {profile.categories.map(cat => (
              <span key={cat} className="userprofile-cat">{cat}</span>
            ))}
          </div>
        )}
      </div>

      {/* Sondaggi */}
      <div className="userprofile-polls-section">
        <h2>Sondaggi</h2>
        {polls.length === 0 ? (
          <p className="userprofile-no-polls">Nessun sondaggio pubblicato.</p>
        ) : (
          <div className="userprofile-polls-grid">
            {polls.map(poll => {
              const tags = poll.hashtags?.length > 0
                ? poll.hashtags
                : poll.category ? [poll.category.toLowerCase()] : [];
              return (
                <Link to={`/poll/${poll.id}`} key={poll.id} className="poll-card">
                  <div className="poll-card-top" style={{ backgroundColor: poll.optionA?.color || '#333' }}>
                    <span>{poll.optionA?.text}</span>
                  </div>
                  <div className="poll-card-line" />
                  <div className="poll-card-bottom" style={{ backgroundColor: poll.optionB?.color || '#666' }}>
                    <span>{poll.optionB?.text}</span>
                  </div>
                  <div className="poll-card-footer">
                    <span className="poll-card-title">{poll.title}</span>
                    {tags.length > 0 && (
                      <div className="poll-card-tags">
                        {tags.slice(0, 2).map(t => (
                          <button
                            key={t}
                            className="poll-card-tag"
                            onClick={e => { e.preventDefault(); navigate(`/?tag=${t}`); }}
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
      </div>
    </div>
  );
}

export default UserProfile;
