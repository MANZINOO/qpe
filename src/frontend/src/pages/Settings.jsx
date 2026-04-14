import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { auth, storage, db } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { resizeImage } from '../utils/imageUtils';
import CookiePreferencesManager from '../components/CookiePreferencesManager';
import './Settings.css';

function Settings() {
  const { user, userProfile, updateUserProfile, enablePushNotifications } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Stato form profilo
  const [username, setUsername] = useState(userProfile?.username || user?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isPrivate, setIsPrivate] = useState(userProfile?.isPrivate || false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Stato avatar upload
  const [avatarPreview, setAvatarPreview] = useState(null); // URL locale anteprima
  const [uploadProgress, setUploadProgress] = useState(null); // 0-100 | null
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Stato notifiche
  const defaultNotifPrefs = { likes: true, comments: true, followers: true, newPolls: true };
  const [notifPrefs, setNotifPrefs] = useState(() => ({
    ...defaultNotifPrefs,
    ...(userProfile?.notifPrefs || {})
  }));
  const [savingNotif, setSavingNotif] = useState(false);
  const [pushPermission, setPushPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [enablingPush, setEnablingPush] = useState(false);

  // Stato privacy
  const defaultPrivacy = { votesVisibility: 'nobody', followApproval: 'everyone' };
  const [privacy, setPrivacy] = useState(() => ({
    ...defaultPrivacy,
    ...(userProfile?.privacySettings || {})
  }));
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Stato cambio password
  const [sendingReset, setSendingReset] = useState(false);

  async function handleEnablePush() {
    setEnablingPush(true);
    try {
      await enablePushNotifications();
      setPushPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        toast.success('Notifiche push attivate!');
      } else {
        toast.error('Permesso negato. Abilita le notifiche nelle impostazioni del browser.');
      }
    } catch {
      toast.error('Errore nell\'attivazione. Riprova.');
    } finally {
      setEnablingPush(false);
    }
  }

  // Salva preferenze notifiche
  async function handleSaveNotifications() {
    setSavingNotif(true);
    try {
      await updateUserProfile({ notifPrefs });
      toast.success('Preferenze notifiche salvate!');
    } catch {
      toast.error('Errore nel salvataggio. Riprova.');
    } finally {
      setSavingNotif(false);
    }
  }

  // Salva impostazioni privacy
  async function handleSavePrivacy() {
    setSavingPrivacy(true);
    try {
      await updateUserProfile({ privacySettings: privacy });
      toast.success('Impostazioni privacy salvate!');
    } catch {
      toast.error('Errore nel salvataggio. Riprova.');
    } finally {
      setSavingPrivacy(false);
    }
  }

  // Invia email reset password
  async function handleSendPasswordReset() {
    const email = user?.email;
    if (!email) return;
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Email di reset inviata a ${email}`);
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        toast.error('Troppi tentativi. Riprova tra qualche minuto.');
      } else {
        toast.error('Errore nell\'invio. Riprova.');
      }
    } finally {
      setSendingReset(false);
    }
  }

  // Quando l'utente sceglie un file
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un\'immagine (JPG, PNG, WebP, GIF)');
      return;
    }
    // Validazione dimensione (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'immagine è troppo grande (max 10 MB)');
      return;
    }

    // Mostra anteprima locale immediatamente
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    // Comprimi e carica
    await uploadAvatar(file);

    // Pulizia URL locale dopo l'upload
    URL.revokeObjectURL(localUrl);
  }

  async function uploadAvatar(file) {
    if (!user) return;
    setUploadingAvatar(true);
    setUploadProgress(0);

    try {
      // 1. Comprimi l'immagine a 400x400 max, JPEG 82%
      const compressed = await resizeImage(file, 400, 0.82);

      // 2. Carica su Firebase Storage
      const storageRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, compressed, {
        contentType: 'image/jpeg'
      });

      // 3. Monitora il progresso
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

      // 4. Ottieni l'URL pubblico
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // 5. Salva su Firestore
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
      // Reset input per permettere di ricaricare lo stesso file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveAvatar() {
    if (!user || !userProfile?.avatar) return;
    setUploadingAvatar(true);
    try {
      // Elimina da Storage (ignora errori se il file non esiste)
      try {
        const storageRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
        await deleteObject(storageRef);
      } catch (_) { /* file già eliminato, va bene */ }

      // Aggiorna Firestore
      await updateUserProfile({ avatar: '' });
      toast.success('Foto profilo rimossa');
    } catch (err) {
      toast.error('Errore nella rimozione. Riprova.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Salvataggio profilo (username + bio + isPrivate)
  async function handleSaveProfile() {
    if (!username.trim()) return;
    setSavingProfile(true);
    try {
      await updateUserProfile({ username: username.trim(), bio: bio.trim(), isPrivate });

      // Se la privacy è cambiata, aggiorna authorIsPrivate su tutti i poll dell'utente
      if (user && isPrivate !== (userProfile?.isPrivate || false)) {
        const pollsSnap = await getDocs(query(collection(db, 'polls'), where('authorId', '==', user.uid)));
        if (!pollsSnap.empty) {
          const batch = writeBatch(db);
          pollsSnap.docs.forEach(d => batch.update(doc(db, 'polls', d.id), { authorIsPrivate: isPrivate }));
          await batch.commit();
        }
      }

      toast.success('Profilo aggiornato!');
    } catch (err) {
      toast.error('Errore nel salvataggio. Riprova.');
    } finally {
      setSavingProfile(false);
    }
  }

  // Export GDPR
  async function handleExportData() {
    setExporting(true);
    const userData = {
      export_info: {
        format: 'JSON',
        exported_at: new Date().toISOString(),
        gdpr_article: 'Art. 20 GDPR - Diritto alla portabilita dei dati'
      },
      profile: {
        username: userProfile?.username || '',
        email: userProfile?.email || user?.email || '',
        bio: userProfile?.bio || '',
        categories: userProfile?.categories || []
      },
      polls_created: [],
      votes: [],
      comments: [],
      likes: [],
      following: userProfile?.following || [],
      followers: userProfile?.followers || [],
      consent_history: [{
        action: 'consent_given',
        timestamp: new Date().toISOString(),
        categories: { necessary: true, analytics: false, marketing: false }
      }]
    };
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qpe_dati_personali_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExporting(false);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  // Eliminazione account
  function handleDeleteStep1() { setShowDeleteConfirm(true); setDeleteStep(1); }
  function handleDeleteStep2() {
    if (deleteConfirmText === 'ELIMINA') {
      setDeleteStep(2);
      setTimeout(() => {
        toast.info('Account eliminato. Tutti i dati personali verranno rimossi entro 30 giorni.');
      }, 1000);
    }
  }

  // Avatar corrente da mostrare (preview locale > Firestore)
  const currentAvatar = avatarPreview || userProfile?.avatar || '';
  const initial = (username || '?')[0].toUpperCase();

  return (
    <div className="settings-page page-enter">
      <div className="settings-container">
        <div className="settings-header">
          <Link to="/" className="settings-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1>Impostazioni</h1>
        </div>

        <div className="settings-tabs">
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profilo</button>
          <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifiche</button>
          <button className={activeTab === 'privacy' ? 'active' : ''} onClick={() => setActiveTab('privacy')}>Privacy e Dati</button>
          <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>Account</button>
          <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>Info</button>
        </div>

        <div className="settings-content">
          {/* ── TAB PROFILO ── */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Modifica profilo</h2>

              {/* Avatar Upload */}
              <div className="form-group">
                <label>Foto profilo</label>
                <div className="avatar-upload-area">
                  {/* Avatar preview */}
                  <div
                    className={`avatar-upload-preview ${uploadingAvatar ? 'avatar-uploading' : ''}`}
                    onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                    title="Clicca per cambiare foto"
                  >
                    {currentAvatar ? (
                      <img src={currentAvatar} alt="Avatar" />
                    ) : (
                      <span className="avatar-initial">{initial}</span>
                    )}

                    {/* Overlay "Cambia" */}
                    {!uploadingAvatar && (
                      <div className="avatar-overlay">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>{currentAvatar ? 'Cambia' : 'Aggiungi'}</span>
                      </div>
                    )}

                    {/* Progress ring durante upload */}
                    {uploadingAvatar && (
                      <div className="avatar-progress-overlay">
                        <svg className="avatar-progress-ring" width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                          <circle
                            cx="32" cy="32" r="28"
                            fill="none" stroke="white" strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - (uploadProgress || 0) / 100)}`}
                            strokeLinecap="round"
                            transform="rotate(-90 32 32)"
                            style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                          />
                        </svg>
                        <span className="avatar-progress-pct">{uploadProgress ?? 0}%</span>
                      </div>
                    )}
                  </div>

                  {/* Bottoni azione */}
                  <div className="avatar-upload-actions">
                    <button
                      className="btn-avatar-upload"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Caricamento...' : currentAvatar ? 'Cambia foto' : 'Carica foto'}
                    </button>
                    {userProfile?.avatar && !uploadingAvatar && (
                      <button
                        className="btn-avatar-remove"
                        onClick={handleRemoveAvatar}
                      >
                        Rimuovi
                      </button>
                    )}
                    <p className="avatar-hint">JPG, PNG, WebP · max 10 MB · ridimensionato a 400×400</p>
                  </div>

                  {/* Input file nascosto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Il tuo username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  value={userProfile?.email || user?.email || ''}
                  disabled
                  style={{ opacity: 0.5, cursor: 'default' }}
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  placeholder="Raccontaci qualcosa di te..."
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={160}
                />
                <span style={{ display: 'block', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {bio.length}/160
                </span>
              </div>
              <div className="toggle-row" style={{ marginBottom: 20 }}>
                <div>
                  <span>Profilo privato</span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {isPrivate ? 'Solo i tuoi follower approvati vedono i tuoi sondaggi' : 'Il tuo profilo è visibile a tutti'}
                  </p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
              <button
                className="btn-save-settings"
                onClick={handleSaveProfile}
                disabled={savingProfile || !username.trim()}
              >
                {savingProfile ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          )}

          {/* ── TAB NOTIFICHE ── */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Gestione notifiche</h2>

              {/* Push notifications */}
              {pushPermission !== 'unsupported' && (
                <div className="push-notif-block">
                  <div className="push-notif-info">
                    <strong>Notifiche push</strong>
                    <span className="push-notif-status">
                      {pushPermission === 'granted' && '✓ Attive'}
                      {pushPermission === 'denied' && '✗ Bloccate dal browser'}
                      {pushPermission === 'default' && 'Non ancora attivate'}
                    </span>
                  </div>
                  {pushPermission !== 'denied' && pushPermission !== 'granted' && (
                    <button
                      className="btn-save-settings"
                      onClick={handleEnablePush}
                      disabled={enablingPush}
                      style={{ marginBottom: 0 }}
                    >
                      {enablingPush ? 'Attivazione...' : 'Attiva notifiche push'}
                    </button>
                  )}
                  {pushPermission === 'denied' && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      Per attivarle, vai nelle impostazioni del browser e consenti le notifiche per questo sito.
                    </p>
                  )}
                </div>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
              <div className="toggle-row">
                <span>Like ai tuoi sondaggi</span>
                <label className="switch">
                  <input type="checkbox" checked={notifPrefs.likes}
                    onChange={e => setNotifPrefs(p => ({ ...p, likes: e.target.checked }))} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-row">
                <span>Commenti ai tuoi sondaggi</span>
                <label className="switch">
                  <input type="checkbox" checked={notifPrefs.comments}
                    onChange={e => setNotifPrefs(p => ({ ...p, comments: e.target.checked }))} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-row">
                <span>Nuovi follower</span>
                <label className="switch">
                  <input type="checkbox" checked={notifPrefs.followers}
                    onChange={e => setNotifPrefs(p => ({ ...p, followers: e.target.checked }))} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="toggle-row">
                <span>Nuovi sondaggi da chi segui</span>
                <label className="switch">
                  <input type="checkbox" checked={notifPrefs.newPolls}
                    onChange={e => setNotifPrefs(p => ({ ...p, newPolls: e.target.checked }))} />
                  <span className="slider"></span>
                </label>
              </div>
              <button className="btn-save-settings" onClick={handleSaveNotifications} disabled={savingNotif}>
                {savingNotif ? 'Salvataggio...' : 'Salva preferenze'}
              </button>
            </div>
          )}

          {/* ── TAB PRIVACY ── */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy e dati personali</h2>
              <div className="privacy-block">
                <h3>Chi può vedere i miei voti passati</h3>
                <select value={privacy.votesVisibility}
                  onChange={e => setPrivacy(p => ({ ...p, votesVisibility: e.target.value }))}>
                  <option value="everyone">Tutti</option>
                  <option value="followers">Solo chi mi segue</option>
                  <option value="nobody">Nessuno</option>
                </select>
              </div>
              <div className="privacy-block">
                <h3>Chi può seguirmi</h3>
                <select value={privacy.followApproval}
                  onChange={e => setPrivacy(p => ({ ...p, followApproval: e.target.value }))}>
                  <option value="everyone">Tutti</option>
                  <option value="approval">Con la mia approvazione</option>
                </select>
              </div>
              <button className="btn-save-settings" onClick={handleSavePrivacy} disabled={savingPrivacy}
                style={{ marginBottom: 20 }}>
                {savingPrivacy ? 'Salvataggio...' : 'Salva impostazioni privacy'}
              </button>
              <div className="privacy-block">
                <h3>Preferenze cookie</h3>
                <CookiePreferencesManager />
              </div>
              <div className="privacy-block gdpr-section">
                <h3>I miei dati (GDPR)</h3>
                <p className="gdpr-note">
                  In conformità con il Regolamento (UE) 2016/679, hai il diritto
                  di scaricare o eliminare tutti i tuoi dati personali.
                </p>
                <div className="gdpr-actions">
                  <div className="gdpr-action-card">
                    <h4>Scarica i miei dati</h4>
                    <p>Ricevi un file JSON con tutti i tuoi dati personali. (Art. 20 GDPR)</p>
                    <button className="btn-export" onClick={handleExportData} disabled={exporting}>
                      {exporting ? 'Preparazione...' : exported ? 'Download avviato!' : 'Scarica i miei dati'}
                    </button>
                  </div>
                  <div className="gdpr-action-card danger">
                    <h4>Elimina il mio account e tutti i miei dati</h4>
                    <p>Questa azione è irreversibile. (Art. 17 GDPR - Diritto all'oblio)</p>
                    {!showDeleteConfirm && (
                      <button className="btn-delete" onClick={handleDeleteStep1}>Elimina il mio account</button>
                    )}
                    {showDeleteConfirm && deleteStep === 1 && (
                      <div className="delete-confirm">
                        <p className="delete-warning">Scrivi ELIMINA per confermare.</p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={e => setDeleteConfirmText(e.target.value)}
                          placeholder='Scrivi "ELIMINA" per confermare'
                        />
                        <div className="delete-actions">
                          <button className="btn-cancel" onClick={() => { setShowDeleteConfirm(false); setDeleteStep(0); setDeleteConfirmText(''); }}>Annulla</button>
                          <button className="btn-delete-final" disabled={deleteConfirmText !== 'ELIMINA'} onClick={handleDeleteStep2}>Conferma eliminazione</button>
                        </div>
                      </div>
                    )}
                    {deleteStep === 2 && <p className="delete-success">Account in fase di eliminazione.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB ACCOUNT ── */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Gestione account</h2>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.5, cursor: 'default' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  L'email non può essere modificata.
                </span>
              </div>
              <div className="form-group">
                <label>Password</label>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  Riceverai un'email a <strong>{user?.email}</strong> con il link per reimpostare la password.
                </p>
                <button
                  className="btn-change"
                  onClick={handleSendPasswordReset}
                  disabled={sendingReset}
                >
                  {sendingReset ? 'Invio in corso...' : 'Invia email di reset password'}
                </button>
              </div>
              <div className="form-group">
                <label>Tema</label>
                <div className="theme-selector">
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => { setTheme('light'); toast.info('Tema chiaro attivato'); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    Chiaro
                  </button>
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => { setTheme('dark'); toast.info('Tema scuro attivato'); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Scuro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB INFO ── */}
          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>Informazioni app</h2>
              <div className="info-row"><span>Versione</span><span>0.6.0</span></div>
              <div className="info-row"><span>Licenza</span><span>MIT</span></div>
              <div className="info-row"><span>Contatti</span><span>info@qpe.app</span></div>
              <div className="info-links">
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/cookie-policy">Cookie Policy</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
