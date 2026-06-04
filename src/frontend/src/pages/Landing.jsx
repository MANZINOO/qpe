import { Link } from 'react-router-dom';
import './Landing.css';

const MOCK_POLLS = [
  { a: 'Pizza', b: 'Sushi', colorA: '#e74c3c', colorB: '#3498db', title: 'Cena del venerdì?', votes: '2.4k', pctA: 62 },
  { a: 'Mare', b: 'Montagna', colorA: '#00b4d8', colorB: '#2ecc71', title: 'Vacanze estive?', votes: '5.1k', pctA: 55 },
  { a: 'iOS', b: 'Android', colorA: '#555', colorB: '#27ae60', title: 'Quale sistema?', votes: '8.9k', pctA: 48 },
];

function PollCard({ poll, style }) {
  return (
    <div className="lp-poll-card" style={style}>
      <div className="lp-poll-coupe">
        <div className="lp-poll-half" style={{ background: poll.colorA }}>
          <span className="lp-poll-opt">{poll.a}</span>
          <span className="lp-poll-pct">{poll.pctA}%</span>
        </div>
        <div className="lp-poll-vs">VS</div>
        <div className="lp-poll-half" style={{ background: poll.colorB }}>
          <span className="lp-poll-opt">{poll.b}</span>
          <span className="lp-poll-pct">{100 - poll.pctA}%</span>
        </div>
      </div>
      <div className="lp-poll-footer">
        <span className="lp-poll-title">{poll.title}</span>
        <span className="lp-poll-votes">🗳 {poll.votes}</span>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <img src="/qpe_logo.svg" alt="QPé" className="lp-nav-logo" />
        <div className="lp-nav-right">
          <Link to="/login" className="lp-link">Accedi</Link>
          <Link to="/signup" className="lp-btn-outline">Registrati</Link>
        </div>
      </nav>

      {/* ── Hero fullscreen ── */}
      <section className="lp-hero-wrap">
      <div className="lp-hero">

        <div className="lp-hero-text">
          <p className="lp-eyebrow">Il social dei sondaggi</p>
          <h1 className="lp-headline">
            Vota.<br />
            Crea.<br />
            <span className="lp-headline-accent">Scopri.</span>
          </h1>
          <p className="lp-sub">
            Sfide binarie, risultati in tempo reale,<br className="lp-br" />
            community italiana. Gratis.
          </p>
          <Link to="/signup" className="lp-cta">
            Inizia adesso — è gratis
          </Link>
          <p className="lp-cta-note">Nessuna carta di credito richiesta</p>
        </div>

        {/* Phone mockup con poll cards */}
        <div className="lp-phone">
          <div className="lp-phone-frame">
            <div className="lp-phone-notch" />
            <div className="lp-phone-screen">
              {MOCK_POLLS.map((poll, i) => (
                <PollCard key={i} poll={poll} style={{ '--i': i }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="lp-strip">
        <div className="lp-strip-item">
          <span className="lp-strip-num">100%</span>
          <span className="lp-strip-label">Gratuito</span>
        </div>
        <div className="lp-strip-div" />
        <div className="lp-strip-item">
          <span className="lp-strip-num">2</span>
          <span className="lp-strip-label">Opzioni per sondaggio</span>
        </div>
        <div className="lp-strip-div" />
        <div className="lp-strip-item">
          <span className="lp-strip-num">∞</span>
          <span className="lp-strip-label">Voti possibili</span>
        </div>
      </section>

      {/* ── Feature 1 ── */}
      <section className="lp-feature lp-feature-dark">
        <div className="lp-feature-visual lp-visual-feed">
          {MOCK_POLLS.slice(0, 2).map((poll, i) => (
            <PollCard key={i} poll={poll} style={{ '--i': i, transform: i === 1 ? 'scale(0.92) translateX(24px)' : 'scale(1)' }} />
          ))}
        </div>
        <div className="lp-feature-text">
          <span className="lp-tag">Feed</span>
          <h2>Ogni giorno nuovi sondaggi</h2>
          <p>Scorri il feed e vota su tutto — food, tech, viaggi, sport. Scopri cosa pensa la community italiana in tempo reale.</p>
        </div>
      </section>

      {/* ── Feature 2 ── */}
      <section className="lp-feature lp-feature-rev">
        <div className="lp-feature-text">
          <span className="lp-tag">Crea</span>
          <h2>La tua sfida, le tue regole</h2>
          <p>In pochi secondi crei un sondaggio con colori, immagini e hashtag. Puoi anche aggiungere una copertina.</p>
        </div>
        <div className="lp-feature-visual lp-visual-create">
          <div className="lp-create-mock">
            <div className="lp-create-row">
              <div className="lp-create-dot" style={{ background: '#e74c3c' }} />
              <div className="lp-create-dot" style={{ background: '#3498db' }} />
              <div className="lp-create-dot" style={{ background: '#2ecc71' }} />
              <div className="lp-create-dot" style={{ background: '#9b59b6' }} />
            </div>
            <div className="lp-create-field">Pizza 🍕</div>
            <div className="lp-create-vs">VS</div>
            <div className="lp-create-field">Sushi 🍣</div>
            <div className="lp-create-tag">#food &nbsp; #italia</div>
            <div className="lp-create-btn">Pubblica</div>
          </div>
        </div>
      </section>

      {/* ── Plus ── */}
      <section className="lp-plus">
        <div className="lp-plus-inner">
          <span className="lp-plus-star">⭐</span>
          <h2>QPé Plus</h2>
          <p>Sondaggi illimitati e badge esclusivo a soli <strong>€3/mese</strong>.</p>
          <Link to="/plus" className="lp-plus-btn">Scopri Plus</Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-final">
        <div className="lp-glow lp-glow-3" />
        <h2 className="lp-final-title">Pronto a votare?</h2>
        <Link to="/signup" className="lp-cta">Crea il tuo account</Link>
        <p className="lp-cta-note">Già registrato? <Link to="/login" className="lp-inline-link">Accedi</Link></p>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <span className="lp-nav-brand" style={{ opacity: 0.4 }}>QPé</span>
        <div className="lp-footer-links">
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/cookie-policy">Cookie</Link>
          <Link to="/plus">Plus</Link>
        </div>
        <span className="lp-footer-copy">© 2026 QPé</span>
      </footer>

    </div>
  );
}

export default Landing;
