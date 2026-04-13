import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { initConsentSystem } from './utils/cookieConsent';
import { onForegroundMessage } from './utils/fcm';
import CookieBanner from './components/CookieBanner';

// Mostra un toast quando arriva una notifica push con l'app aperta
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
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
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
import './App.css';

function App() {
  useEffect(() => {
    initConsentSystem();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <FcmForegroundHandler />
            <div className="app">
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
              </Routes>
              <BottomNav />
              <Footer />
              <CookieBanner />
            </div>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
