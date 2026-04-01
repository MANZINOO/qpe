import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './UserProfile.css';

function UserProfile() {
  const { uid } = useParams();
  const { user, userProfile, followUser, unfollowUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user && user.uid === uid;
  const isFollowing = userProfile?.following?.includes(uid) || false;

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
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="userprofile-page">
        <div className="userprofile-loading">Caricamento...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="userprofile-page">
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
    <div className="userprofile-page">
      {/* Header */}
      <div className="userprofile-header">
        <Link to="/" className="userprofile-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="userprofile-header-name">@{displayName}</span>
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

        {/* Pulsante follow / modifica */}
        <div className="userprofile-action">
          {isOwnProfile ? (
            <Link to="/settings" className="userprofile-btn edit">Modifica profilo</Link>
          ) : user ? (
            <button
              className={`userprofile-btn ${isFollowing ? 'following' : 'follow'}`}
              onClick={handleFollow}
              disabled={followLoading || !userProfile}
            >
              {followLoading || !userProfile ? '...' : isFollowing ? 'Segui già' : 'Segui'}
            </button>
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
      </div>
    </div>
  );
}

export default UserProfile;
