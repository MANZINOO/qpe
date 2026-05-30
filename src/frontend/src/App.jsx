import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { RemoteConfigProvider, useRemoteConfig } from './context/RemoteConfigContext';
import { initConsentSystem } from './utils/cookieConsent';
import { onForegroundMessage } from './utils/fcm';
import CookieBanner from './components/CookieBanner';
import BannedScreen from './components/BannedScreen';

function FcmForegroundHandler() {
  const toast = useToast();
  useEffect(() => {
    const unsub = onForegroundMessage(payload => {
      const n = payload.notification || payload.data || {};
      toast.info(`${n.title || 'QPé'}: ${n.body || ''}`);
    });
    return unsub;
  }, [toast]);
  return null;
}

// Mostra la schermata di ban se l'utente è nella lista banned_uids di Remote Config
function BanGuard({ children }) {
  const { user, userProfile, loading } = useAuth();
  const { bannedUids, bannedUsernames } = useRemoteConfig();

  if (!loading && user) {
    const uidBanned      = bannedUids.includes(user.uid);
    const usernameBanned = userProfile?.username
      ? bannedUsernames.includes(userProfile.username.toLowerCase())
      : false;

    if (uidBanned || usernameBanned) {
      return <BannedScreen />;
    }
  }
  return children;
}

import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Settings from './pages/Settings';
import CreatePoll from './pages/CreatePoll';
import PollView from './pages/PollView';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import ReelView from './pages/ReelView';
import Advertise from './pages/Advertise';
import Plus from './pages/Plus';
import PlusSuccess from './pages/PlusSuccess';
import './App.css';

function App() {
  useEffect(() => {
    initConsentSystem();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <RemoteConfigProvider>
          <AuthProvider>
            <ToastProvider>
              <FcmForegroundHandler />
              <BanGuard>
                <div className="app">
                  <Sidebar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/create" element={<CreatePoll />} />
                    <Route path="/poll/:id" element={<PollView />} />
                    <Route path="/u/:uid" element={<UserProfile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/messages/:convId" element={<Chat />} />
                    <Route path="/reel" element={<ReelView />} />
                    <Route path="/advertise" element={<Advertise />} />
                    <Route path="/plus" element={<Plus />} />
                    <Route path="/plus/success" element={<PlusSuccess />} />
                  </Routes>
                  <BottomNav />
                  <CookieBanner />
                </div>
              </BanGuard>
            </ToastProvider>
          </AuthProvider>
        </RemoteConfigProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
