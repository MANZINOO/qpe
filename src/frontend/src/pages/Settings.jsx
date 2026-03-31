import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CookiePreferencesManager from '../components/CookiePreferencesManager';
import './Settings.css';

function Settings() {
  const { user, userProfile, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Stato form profilo pre-popolato con i dati reali
  const [username, setUsername] = useState(userProfile?.username || user?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Export dei dati utente in formato JSON
  async function handleExportData() {
    setExporting(true);

    // Simula il recupero dei dati utente dal database
    // In produzione questo chiamera l'API backend
    const userData = {
      export_info: {
        format: 'JSON',
        exported_at: new Date().toISOString(),
        gdpr_article: 'Art. 20 GDPR - Diritto alla portabilita dei dati'
      },
      profile: {
        username: 'demo_user',
        email: 'user@example.com',
        bio: '',
        created_at: '2026-03-29T10:00:00Z',
        categories: ['tecnologia', 'sport', 'cultura']
      },
      polls_created: [],
      votes: [],
      comments: [],
      likes: [],
      following: [],
      followers: [],
      consent_history: [
        {
          action: 'consent_given',
          timestamp: new Date().toISOString(),
          categories: { necessary: true, analytics: false, marketing: false }
        }
      ]
    };

    // Crea e scarica il file JSON
    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json'
    });
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

  // Salvataggio profilo
  async function handleSaveProfile() {
    if (!username.trim()) return;
    setSavingProfile(true);
    setSaveMsg('');
    try {
      await updateUserProfile({ username: username.trim(), bio: bio.trim() });
      setSaveMsg('Profilo aggiornato!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Errore nel salvataggio. Riprova.');
    } finally {
      setSavingProfile(false);
    }
  }

  // Eliminazione account a due step
  function handleDeleteStep1() {
    setShowDeleteConfirm(true);
    setDeleteStep(1);
  }

  function handleDeleteStep2() {
    if (deleteConfirmText === 'ELIMINA') {
      setDeleteStep(2);
      // In produzione: chiamata API per eliminare l'account
      // await api.deleteAccount();
      // Redirect alla home dopo eliminazione
      setTimeout(() => {
        alert('Account eliminato. Tutti i dati personali verranno rimossi entro 30 giorni.');
        // window.location.href = '/';
      }, 1000);
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <Link to="/" className="back-link">Torna alla home</Link>
        <h1>Impostazioni</h1>

        <div className="settings-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profilo
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            Notifiche
          </button>
          <button
            className={activeTab === 'privacy' ? 'active' : ''}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy e Dati
          </button>
          <button
            className={activeTab === 'account' ? 'active' : ''}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={activeTab === 'about' ? 'active' : ''}
            onClick={() => setActiveTab('about')}
          >
            Info
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Modifica profilo</h2>
              <div className="form-group">
                <label>Avatar</label>
                <div className="avatar-placeholder">
                  {userProfile?.avatar
                    ? <img src={userProfile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {(username || '?')[0].toUpperCase()}
                      </span>
                  }
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
              </div>
              {saveMsg && (
                <div className={`settings-save-msg ${saveMsg.includes('Errore') ? 'error' : 'success'}`}>
                  {saveMsg}
                </div>
              )}
              <button
                className="btn-save-settings"
                onClick={handleSaveProfile}
                disabled={savingProfile || !username.trim()}
              >
                {savingProfile ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Gestione notifiche</h2>
              <div className="toggle-row">
                <span>Like ai tuoi sondaggi</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
              </div>
              <div className="toggle-row">
                <span>Commenti ai tuoi sondaggi</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
              </div>
              <div className="toggle-row">
                <span>Nuovi follower</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
              </div>
              <div className="toggle-row">
                <span>Nuovi sondaggi da chi segui</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy e dati personali</h2>

              <div className="privacy-block">
                <h3>Chi puo vedere i miei voti passati</h3>
                <select defaultValue="nobody">
                  <option value="everyone">Tutti</option>
                  <option value="followers">Solo chi mi segue</option>
                  <option value="nobody">Nessuno</option>
                </select>
              </div>

              <div className="privacy-block">
                <h3>Chi puo seguirmi</h3>
                <select defaultValue="everyone">
                  <option value="everyone">Tutti</option>
                  <option value="approval">Con la mia approvazione</option>
                </select>
              </div>

              <div className="privacy-block">
                <h3>Preferenze cookie</h3>
                <CookiePreferencesManager />
              </div>

              <div className="privacy-block gdpr-section">
                <h3>I miei dati (GDPR)</h3>
                <p className="gdpr-note">
                  In conformita con il Regolamento (UE) 2016/679, hai il diritto
                  di scaricare o eliminare tutti i tuoi dati personali.
                </p>

                <div className="gdpr-actions">
                  <div className="gdpr-action-card">
                    <h4>Scarica i miei dati</h4>
                    <p>
                      Ricevi un file JSON con tutti i tuoi dati personali:
                      profilo, sondaggi, voti, commenti, like e relazioni.
                      (Art. 20 GDPR - Portabilita)
                    </p>
                    <button
                      className="btn-export"
                      onClick={handleExportData}
                      disabled={exporting}
                    >
                      {exporting ? 'Preparazione...' : exported ? 'Download avviato!' : 'Scarica i miei dati'}
                    </button>
                  </div>

                  <div className="gdpr-action-card danger">
                    <h4>Elimina il mio account e tutti i miei dati</h4>
                    <p>
                      Questa azione e irreversibile. Tutti i tuoi dati personali,
                      sondaggi, voti e commenti verranno eliminati permanentemente
                      entro 30 giorni. (Art. 17 GDPR - Diritto all'oblio)
                    </p>

                    {!showDeleteConfirm && (
                      <button className="btn-delete" onClick={handleDeleteStep1}>
                        Elimina il mio account
                      </button>
                    )}

                    {showDeleteConfirm && deleteStep === 1 && (
                      <div className="delete-confirm">
                        <p className="delete-warning">
                          Sei sicuro? Questa azione non puo essere annullata.
                          Scrivi ELIMINA per confermare.
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder='Scrivi "ELIMINA" per confermare'
                        />
                        <div className="delete-actions">
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteStep(0);
                              setDeleteConfirmText('');
                            }}
                          >
                            Annulla
                          </button>
                          <button
                            className="btn-delete-final"
                            disabled={deleteConfirmText !== 'ELIMINA'}
                            onClick={handleDeleteStep2}
                          >
                            Conferma eliminazione
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteStep === 2 && (
                      <p className="delete-success">
                        Account in fase di eliminazione. Riceverai una email
                        di conferma.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Gestione account</h2>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="La tua email" />
                <button className="btn-change">Cambia email</button>
              </div>
              <div className="form-group">
                <label>Password</label>
                <button className="btn-change">Cambia password</button>
              </div>
              <div className="form-group">
                <label>Tema</label>
                <select defaultValue="system">
                  <option value="light">Chiaro</option>
                  <option value="dark">Scuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>Informazioni app</h2>
              <div className="info-row">
                <span>Versione</span>
                <span>0.1.0 (beta)</span>
              </div>
              <div className="info-row">
                <span>Licenza</span>
                <span>MIT</span>
              </div>
              <div className="info-row">
                <span>Contatti</span>
                <span>info@qpe.app</span>
              </div>
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
