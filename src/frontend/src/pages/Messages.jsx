import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './Messages.css';

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'ora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}g`;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

// Skeleton per le conversazioni
function ConvSkeleton() {
  return (
    <div>
      {[...Array(4)].map((_, i) => (
        <div className="skeleton-conv" key={i}>
          <div className="skeleton skeleton-circle" style={{ width: 48, height: 48, flexShrink: 0 }} />
          <div className="skeleton-conv-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div className="skeleton skeleton-text" style={{ width: 100, marginBottom: 0 }} />
              <div className="skeleton skeleton-text" style={{ width: 30, marginBottom: 0 }} />
            </div>
            <div className="skeleton skeleton-text medium" style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const convs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.lastMessageAt?.toMillis?.() ?? 0;
          const tb = b.lastMessageAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
      setConversations(convs);
      setLoading(false);
    }, (err) => {
      console.error('[QPe] Errore conversazioni:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  function getOther(conv) {
    const otherUid = conv.participants?.find(p => p !== user?.uid) || '';
    return {
      uid: otherUid,
      username: conv.participantUsernames?.[otherUid] || 'Utente',
      avatar: conv.participantAvatars?.[otherUid] || ''
    };
  }

  if (!user) {
    return (
      <div className="messages-page page-enter">
        <div className="messages-header">
          <button className="msg-back" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1>Messaggi</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="empty-state-title">Accedi per i messaggi</p>
          <Link to="/login" className="empty-state-cta">Accedi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page page-enter">
      <div className="messages-header">
        <button className="msg-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Messaggi</h1>
        <Link to="/search" className="msg-new" title="Nuova conversazione">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <ConvSkeleton />
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="empty-state-title">Nessun messaggio</p>
          <p className="empty-state-desc">Invia un messaggio a qualcuno per iniziare</p>
          <Link to="/search" className="empty-state-cta">Trova un utente</Link>
        </div>
      ) : (
        <ul className="conv-list">
          {conversations.map((conv, i) => {
            const other = getOther(conv);
            const unread = conv.unreadCounts?.[user.uid] || 0;
            const isMe = conv.lastMessageUid === user.uid;

            return (
              <li key={conv.id} className="stagger-item" style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}>
                <Link to={`/messages/${conv.id}`} className={`conv-item ${unread > 0 ? 'unread' : ''}`}>
                  <div className="conv-avatar">
                    {other.avatar ? (
                      <img src={other.avatar} alt="" />
                    ) : (
                      <span>{(other.username || '?')[0].toUpperCase()}</span>
                    )}
                    {unread > 0 && <div className="conv-unread-dot" />}
                  </div>
                  <div className="conv-info">
                    <div className="conv-top">
                      <span className="conv-username">@{other.username}</span>
                      <span className="conv-time">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <div className="conv-preview">
                      <span className={unread > 0 ? 'conv-preview-bold' : ''}>
                        {isMe ? 'Tu: ' : ''}{conv.lastMessage || 'Nessun messaggio'}
                      </span>
                      {unread > 0 && <span className="conv-badge">{unread > 9 ? '9+' : unread}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Messages;
