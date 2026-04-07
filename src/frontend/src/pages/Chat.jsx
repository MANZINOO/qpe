import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  doc, getDoc, setDoc, addDoc, collection, query,
  orderBy, onSnapshot, updateDoc, serverTimestamp, increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { getConvId } from '../utils/conversations';
import { createNotification } from '../utils/notifications';
import './Chat.css';

function Chat() {
  const { convId } = useParams();
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  // location.state può contenere { poll } quando si inoltrava un sondaggio
  const [forwardedPoll, setForwardedPoll] = useState(location.state?.poll || null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Scroll all'ultimo messaggio
  function scrollToBottom(behavior = 'smooth') {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior }), 80);
  }

  useEffect(() => {
    if (!user || !convId) return;

    // Carica i metadati della conversazione e azzerai i non-letti
    async function loadConv() {
      try {
        // Se arriva da UserProfile con state.target, crea la conv se non esiste
        if (location.state?.target) {
          const me = {
            uid: user.uid,
            username: userProfile?.username || user.displayName || 'Utente',
            avatar: userProfile?.avatar || ''
          };
          const target = location.state.target;
          const expectedId = getConvId(me.uid, target.uid);
          if (expectedId !== convId) { setNotFound(true); return; }

          const convRef = doc(db, 'conversations', convId);
          const snap = await getDoc(convRef);
          if (!snap.exists()) {
            // Nuova conversazione: crea il documento; niente unread da azzerare
            await setDoc(convRef, {
              participants: [me.uid, target.uid],
              participantUsernames: { [me.uid]: me.username, [target.uid]: target.username },
              participantAvatars: { [me.uid]: me.avatar, [target.uid]: target.avatar || '' },
              lastMessage: '',
              lastMessageAt: serverTimestamp(),
              lastMessageUid: '',
              unreadCounts: { [me.uid]: 0, [target.uid]: 0 },
              createdAt: serverTimestamp()
            });
            setConv({ participants: [me.uid, target.uid], participantUsernames: { [me.uid]: me.username, [target.uid]: target.username }, participantAvatars: { [me.uid]: me.avatar, [target.uid]: target.avatar || '' }, unreadCounts: {} });
          } else {
            setConv({ id: snap.id, ...snap.data() });
            // Azzera unread solo se il documento esiste già
            updateDoc(convRef, { [`unreadCounts.${user.uid}`]: 0 }).catch(() => {});
          }
        } else {
          const snap = await getDoc(doc(db, 'conversations', convId));
          if (!snap.exists()) { setNotFound(true); return; }
          setConv({ id: snap.id, ...snap.data() });
          // Azzera unread
          updateDoc(doc(db, 'conversations', convId), {
            [`unreadCounts.${user.uid}`]: 0
          }).catch(() => {});
        }
      } catch (err) {
        console.error('[QPe] Errore caricamento chat:', err);
      }
    }

    loadConv();

    // Real-time listener messaggi
    const q = query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      scrollToBottom();
    }, () => setLoading(false));

    return unsubscribe;
  }, [user?.uid, convId]);

  // Focus input se arriva un sondaggio da inoltrare
  useEffect(() => {
    if (forwardedPoll) inputRef.current?.focus();
  }, [forwardedPoll]);

  async function handleSend(e) {
    e?.preventDefault();
    if (!user || sending) return;
    if (!text.trim() && !forwardedPoll) return;

    setSending(true);
    const username = userProfile?.username || user.displayName || 'Utente';

    const msg = {
      fromUid: user.uid,
      fromUsername: username,
      type: forwardedPoll ? 'poll' : 'text',
      text: text.trim(),
      poll: forwardedPoll || null,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'conversations', convId, 'messages'), msg);

      // Aggiorna metadati conversazione
      const currentConv = conv;
      const otherUid = currentConv?.participants?.find(p => p !== user.uid);
      const preview = forwardedPoll
        ? `📊 ${forwardedPoll.title}`
        : text.trim().slice(0, 60);

      await updateDoc(doc(db, 'conversations', convId), {
        lastMessage: preview,
        lastMessageAt: serverTimestamp(),
        lastMessageUid: user.uid,
        ...(otherUid ? { [`unreadCounts.${otherUid}`]: increment(1) } : {})
      });

      // Notifica
      if (otherUid) {
        createNotification(otherUid, {
          type: 'message',
          fromUid: user.uid,
          fromUsername: username
        });
      }

      setText('');
      setForwardedPoll(null);
      scrollToBottom();
    } catch (err) {
      console.error('[QPe] Errore invio:', err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!user) {
    return (
      <div className="chat-page page-enter">
        <div className="chat-header">
          <button className="chat-back" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>
        <div className="chat-state"><Link to="/login">Accedi</Link> per chattare</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="chat-page page-enter">
        <div className="chat-header">
          <button className="chat-back" onClick={() => navigate('/messages')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>
        <div className="chat-state">Conversazione non trovata.</div>
      </div>
    );
  }

  // Info sull'altro utente
  const otherUid = conv?.participants?.find(p => p !== user.uid);
  const otherUsername = conv?.participantUsernames?.[otherUid] || '...';
  const otherAvatar = conv?.participantAvatars?.[otherUid] || '';

  return (
    <div className="chat-page page-enter">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back" onClick={() => navigate('/messages')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <Link to={otherUid ? `/u/${otherUid}` : '#'} className="chat-header-user">
          <div className="chat-header-avatar">
            {otherAvatar ? (
              <img src={otherAvatar} alt="" />
            ) : (
              <span>{(otherUsername || '?')[0].toUpperCase()}</span>
            )}
          </div>
          <span className="chat-header-username">@{otherUsername}</span>
        </Link>
      </div>

      {/* Messaggi */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-state">Caricamento...</div>
        ) : messages.length === 0 ? (
          <div className="chat-state chat-state-empty">
            Nessun messaggio ancora.<br />Inizia la conversazione!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.fromUid === user.uid;
            return (
              <div key={msg.id} className={`chat-msg ${isMe ? 'mine' : 'theirs'}`}>
                {msg.type === 'poll' && msg.poll ? (
                  <div className="chat-poll-card">
                    {/* Anteprima colori sondaggio */}
                    <div className="chat-poll-colors">
                      <div style={{ background: msg.poll.optionA?.color || '#333' }} />
                      <div style={{ background: msg.poll.optionB?.color || '#666' }} />
                    </div>
                    <div className="chat-poll-body">
                      <span className="chat-poll-label">Sondaggio inoltrato</span>
                      <Link to={`/poll/${msg.poll.id}`} className="chat-poll-title">
                        {msg.poll.title}
                      </Link>
                      <span className="chat-poll-opts">
                        {msg.poll.optionA?.text} vs {msg.poll.optionB?.text}
                      </span>
                      {msg.text && <p className="chat-poll-note">{msg.text}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="chat-bubble">
                    <p>{msg.text}</p>
                  </div>
                )}
                <span className="chat-msg-time">
                  {msg.createdAt?.toDate
                    ? msg.createdAt.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Anteprima sondaggio da inoltrare */}
      {forwardedPoll && (
        <div className="chat-forward-preview">
          <div className="chat-forward-colors">
            <div style={{ background: forwardedPoll.optionA?.color || '#333' }} />
            <div style={{ background: forwardedPoll.optionB?.color || '#666' }} />
          </div>
          <div className="chat-forward-info">
            <span className="chat-forward-label">Inoltro sondaggio</span>
            <span className="chat-forward-title">{forwardedPoll.title}</span>
          </div>
          <button className="chat-forward-remove" onClick={() => setForwardedPoll(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder={forwardedPoll ? 'Aggiungi un messaggio (opzionale)...' : 'Scrivi un messaggio...'}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          maxLength={500}
          autoComplete="off"
        />
        <button
          className="chat-send"
          type="submit"
          disabled={sending || (!text.trim() && !forwardedPoll)}
        >
          {sending ? (
            <div className="chat-send-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default Chat;
