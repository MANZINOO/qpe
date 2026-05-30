import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { resizeImage } from '../utils/imageUtils';
import './Auth.css';
import './UserProfile.css';

function Profile() {
  const { user, userProfile, logout, updateUserProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [polls, setPolls] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user?.uid) loadPolls();
  }, [user?.uid]);

  async function loadPolls() {
    try {
      const q = query(
        collection(db, 'polls'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.warn('[QPe] Errore caricamento poll:', err.message);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un\'immagine (JPG, PNG, WebP, GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'immagine è troppo grande (max 10 MB)');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    await uploadAvatar(file);
    URL.revokeObjectURL(localUrl);
  }

  async function uploadAvatar(file) {
    if (!user) return;
    setUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const compressed = await resizeImage(file, 400, 0.82);
      const storageRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, compressed, {
        contentType: 'image/jpeg'
      });

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
            setUploadProgress(pct);
          },
          (err) => reject(err),
          () => resolve()
        );
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      await updateUserProfile({ avatar: downloadURL });
      setAvatarPreview(null);
      toast.success('Foto profilo aggiornata!');
    } catch (err) {
      console.error('[QPe] Errore upload avatar:', err);
      setAvatarPreview(null);
      if (err.code === 'storage/unauthorized') {
        toast.error('Permesso negato. Controlla le regole di Firebase Storage.');
      } else {
        toast.error('Errore nel caricamento. Riprova.');
      }
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!user) {
    return (
      <div className="auth-page page-enter">
        <div className="auth-container">
          <h2>Non sei autenticato</h2>
          <Link to="/login" className="auth-btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>
            Accedi
          </Link>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.username || user.displayName || 'Utente';
  const email = userProfile?.email || user.email || '';
  const bio = userProfile?.bio || '';
  const categories = userProfile?.categories || [];
  const initial = displayName[0]?.toUpperCase() || '?';
  const currentAvatar = avatarPreview || userProfile?.avatar || '';

  return (
    <div className="profile-page page-enter">
      {/* Header sticky con freccia indietro */}
      <div className="profile-topbar">
        <button className="profile-topbar-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="profile-topbar-title">
          @{displayName}
          {userProfile?.plus && <span className="plus-badge" title="QPé Plus">⭐</span>}
        </span>
        <div style={{ width: 32 }} />
      </div>

      <div className="profile-header">

        {/* Avatar cliccabile con overlay */}
        <div
          className={`profile-avatar-large profile-avatar-clickable ${uploadingAvatar ? 'profile-avatar-uploading' : ''}`}
          onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          title="Clicca per cambiare foto"
        >
          {currentAvatar ? (
            <img src={currentAvatar} alt={displayName} style={{ objectFit: 'cover' }} />
          ) : (
            <span>{initial}</span>
          )}

          {/* Overlay camera (visibile solo al hover, non durante upload) */}
          {!uploadingAvatar && (
            <div className="profile-avatar-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}

          {/* Progress ring durante upload */}
          {uploadingAvatar && (
            <div className="profile-avatar-progress">
              <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute' }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                <circle
                  cx="26" cy="26" r="22"
                  fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - (uploadProgress || 0) / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 26 26)"
                  style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                />
              </svg>
              <span style={{ position: 'relative', fontSize: 11, fontWeight: 700, color: 'white' }}>
                {uploadProgress ?? 0}%
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <h1 className="profile-username">
          @{displayName}
          {userProfile?.plus && <span className="plus-badge" title="QPé Plus">⭐</span>}
        </h1>
        <p className="profile-email">{email}</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">{polls.length}</span>
              <span className="profile-stat-label">Sondaggi</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{(userProfile?.followers || []).length}</span>
              <span className="profile-stat-label">Follower</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{(userProfile?.following || []).length}</span>
              <span className="profile-stat-label">Seguiti</span>
            </div>
          </div>
        </div>

        {bio && (
          <div className="profile-card">
            <h3>Bio</h3>
            <p className="profile-bio">{bio}</p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="profile-card">
            <h3>Interessi</h3>
            <div className="profile-categories">
              {categories.map(cat => (
                <span key={cat} className="profile-cat-tag">{cat}</span>
              ))}
            </div>
          </div>
        )}

        <div className="profile-card">
          <div className="profile-actions">
            <Link to="/settings" className="btn-edit-profile">
              Modifica profilo
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              Esci
            </button>
          </div>
          {!userProfile?.plus && (
            <Link to="/plus" className="btn-plus-upsell">
              ⭐ Passa a QPé Plus
            </Link>
          )}
        </div>
      </div>

      {/* Sondaggi pubblicati */}
      <div className="userprofile-polls-section">
        <h2>I tuoi sondaggi</h2>
        {polls.length === 0 ? (
          <p className="userprofile-no-polls">Non hai ancora pubblicato sondaggi.</p>
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
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }}>
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

export default Profile;
