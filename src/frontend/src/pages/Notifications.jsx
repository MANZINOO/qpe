import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import './Notifications.css';

const NOTIF_MESSAGES = {
  follow: (n) => `ti ha iniziato a seguire`,
  followRequest: (n) => `vuole seguirti`,
  vote: (n) => `ha votato "${n.pollTitle || 'il tuo sondaggio'}"`,
  like: (n) => `ha messo like a "${n.pollTitle || 'il tuo sondaggio'}"`,
  comment: (n) => `ha commentato "${n.pollTitle || 'il tuo sondaggio'}"`,
  message: (n) => `ti ha inviato un messaggio`
};

const NOTIF_ICONS = {
  followRequest: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  follow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  ),
  vote: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  like: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--danger)" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  comment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  message: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
};

function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'ora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}g`;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

// Skeleton per le notifiche
function NotifSkeleton() {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div className="skeleton-notif" key={i}>
          <div className="skeleton skeleton-circle" style={{ width: 40, height: 40, flexShrink: 0 }} />
          <div className="skeleton-notif-body">
            <div className="skeleton skeleton-text medium" />
            <div className="skeleton skeleton-text short" style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Notifications() {
  const { user, acceptFollowRequest, rejectFollowRequest } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestActions, setRequestActions] = useState({}); // { [notifId]: 'accepted'|'rejected'|'loading' }

  // Real-time listener sulle notifiche
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
      setLoading(false);

      // Marca automaticamente tutte come lette all'apertura della pagina
      const unread = snapshot.docs.filter(d => !d.data().read);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(d => {
          batch.update(doc(db, 'users', user.uid, 'notifications', d.id), { read: true });
        });
        batch.commit().catch(() => {});
      }
    }, (err) => {
      console.error('[QPe] Errore notifiche:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  async function markAsRead(notifId) {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), { read: true });
    } catch (err) {
      console.warn('[QPe] Errore mark as read:', err.message);
    }
  }

  async function markAllAsRead() {
    if (!user) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('[QPe] Errore mark all read:', err.message);
    }
  }

  function handleNotifClick(notif) {
    if (!notif.read) markAsRead(notif.id);
    if (notif.type === 'follow') {
      navigate(`/u/${notif.fromUid}`);
    } else if (notif.type === 'message') {
      const ids = [user.uid, notif.fromUid].sort().join('_');
      navigate(`/messages/${ids}`);
    } else if (notif.pollId) {
      navigate(`/poll/${notif.pollId}`);
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="notifications-page page-enter">
        <div className="notifications-header">
          <Link to="/" className="notif-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1>Notifiche</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="empty-state-title">Accedi per le notifiche</p>
          <Link to="/login" className="empty-state-cta">Accedi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page page-enter">
      {/* Header */}
      <div className="notifications-header">
        <Link to="/" className="notif-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1>Notifiche</h1>
        {unreadCount > 0 && (
          <button className="notif-mark-all" onClick={markAllAsRead}>
            Segna tutte lette
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <NotifSkeleton />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="empty-state-title">Nessuna notifica</p>
          <p className="empty-state-desc">Le tue notifiche appariranno qui</p>
        </div>
      ) : (
        <ul className="notif-list">
          {notifications.map((notif, i) => {
            const getMessage = NOTIF_MESSAGES[notif.type];
            const icon = NOTIF_ICONS[notif.type];

            const action = requestActions[notif.id];

            return (
              <li
                key={notif.id}
                className={`notif-item stagger-item ${!notif.read ? 'unread' : ''}`}
                style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
                onClick={() => notif.type !== 'followRequest' && handleNotifClick(notif)}
              >
                <div className={`notif-icon notif-icon-${notif.type}`}>
                  {icon}
                </div>
                <div className="notif-content">
                  <p className="notif-text">
                    <strong>@{notif.fromUsername}</strong>{' '}
                    {getMessage ? getMessage(notif) : 'ha interagito'}
                  </p>
                  <span className="notif-time">{timeAgo(notif.createdAt)}</span>
                  {notif.type === 'followRequest' && (
                    <div className="notif-fr-actions">
                      {!action && (
                        <>
                          <button
                            className="notif-fr-btn accept"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setRequestActions(p => ({ ...p, [notif.id]: 'loading' }));
                              await acceptFollowRequest(notif.fromUid);
                              setRequestActions(p => ({ ...p, [notif.id]: 'accepted' }));
                            }}
                          >Accetta</button>
                          <button
                            className="notif-fr-btn reject"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setRequestActions(p => ({ ...p, [notif.id]: 'loading' }));
                              await rejectFollowRequest(notif.fromUid);
                              setRequestActions(p => ({ ...p, [notif.id]: 'rejected' }));
                            }}
                          >Rifiuta</button>
                        </>
                      )}
                      {action === 'loading' && <span className="notif-fr-status">...</span>}
                      {action === 'accepted' && <span className="notif-fr-status accepted">Accettato</span>}
                      {action === 'rejected' && <span className="notif-fr-status rejected">Rifiutato</span>}
                    </div>
                  )}
                </div>
                {!notif.read && <div className="notif-dot" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
