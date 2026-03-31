import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Profile() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) {
    return (
      <div className="auth-page">
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

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link to="/" className="back-link" style={{ color: 'rgba(255,255,255,0.8)', position: 'absolute', top: 16, left: 16 }}>
          Torna alla home
        </Link>

        {userProfile?.avatar ? (
          <img
            src={userProfile.avatar}
            alt={displayName}
            className="profile-avatar-large"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="profile-avatar-large">{initial}</div>
        )}
        <h1 className="profile-username">@{displayName}</h1>
        <p className="profile-email">{email}</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">0</span>
              <span className="profile-stat-label">Sondaggi</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">0</span>
              <span className="profile-stat-label">Follower</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">0</span>
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
        </div>
      </div>
    </div>
  );
}

export default Profile;
