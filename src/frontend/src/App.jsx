import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initConsentSystem } from './utils/cookieConsent';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Settings from './pages/Settings';
import CreatePoll from './pages/CreatePoll';
import PollView from './pages/PollView';
import './App.css';

function App() {
  useEffect(() => {
    initConsentSystem();
  }, []);

  return (
    <Router>
      <AuthProvider>
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
          </Routes>
          <Footer />
          <CookieBanner />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
