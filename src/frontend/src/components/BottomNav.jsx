import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './BottomNav.css';

function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Listener notifiche non lette
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

  // Listener messaggi non letti
  useEffect(() => {
    if (!user) { setUnreadMessages(0); return; }
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, snap => {
      const total = snap.docs.reduce((s, d) => s + (d.data().unreadCounts?.[user.uid] || 0), 0);
      setUnreadMessages(total);
    }, () => setUnreadMessages(0));
    return unsub;
  }, [user?.uid]);

  // Non mostrare su pagine auth o se non loggato (DOPO tutti gli hooks)
  const hideOn = ['/login', '/signup', '/privacy-policy', '/cookie-policy'];
  if (!user || hideOn.some(p => location.pathname.startsWith(p))) return null;
  // Non mostrare nella chat individuale
  if (location.pathname.match(/^\/messages\/.+/)) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Home</span>
      </Link>

      <Link to="/search" className={`bottom-nav-item ${isActive('/search') ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Cerca</span>
      </Link>

      <Link to="/create" className="bottom-nav-item bottom-nav-create">
        <div className="bottom-nav-create-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </Link>

      <Link to="/notifications" className={`bottom-nav-item ${isActive('/notifications') ? 'active' : ''}`}>
        <div className="bottom-nav-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadNotifs > 0 && (
            <span className="bottom-nav-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
          )}
        </div>
        <span>Notifiche</span>
      </Link>

      <Link to="/messages" className={`bottom-nav-item ${isActive('/messages') ? 'active' : ''}`}>
        <div className="bottom-nav-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {unreadMessages > 0 && (
            <span className="bottom-nav-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
          )}
        </div>
        <span>Messaggi</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
