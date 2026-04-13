import { Link } from 'react-router-dom';
import './Advertise.css';

const FORMATS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    name: 'Sondaggio Sponsorizzato',
    desc: 'Il tuo brand diventa l\'autore di un sondaggio che appare in cima al feed. Massima visibilità, engagement diretto.',
    tag: 'Più popolare',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    name: 'Native Ad',
    desc: 'Un post che si integra naturalmente nel feed degli utenti con tag "Sponsorizzato". Non invasivo, alto CTR.',
    tag: null,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    name: 'Reel Sponsorizzato',
    desc: 'Il tuo sondaggio appare nella modalità Reel (swipe verticale). Formato immersivo, ideale per campagne di brand awareness.',
    tag: 'Nuovo',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    name: 'Research Panel',
    desc: 'Accedi ai dati aggregati e anonimi di migliaia di voti per ricerche di mercato e analisi demografiche.',
    tag: null,
  },
];

const STATS = [
  { value: '10K+', label: 'Utenti attivi' },
  { value: '50K+', label: 'Sondaggi creati' },
  { value: '500K+', label: 'Voti totali' },
  { value: '4 min', label: 'Tempo medio sessione' },
];

const PACKAGES = [
  {
    name: 'Starter',
    price: '€299',
    period: '/ mese',
    features: ['1 sondaggio sponsorizzato', '7 giorni di visibilità', 'Targeting per categoria', 'Report base'],
    cta: 'Inizia ora',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '€799',
    period: '/ mese',
    features: ['4 sondaggi sponsorizzati', '30 giorni di visibilità', 'Targeting avanzato', 'Report dettagliato', 'A/B testing'],
    cta: 'Inizia ora',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Volume illimitato', 'Account manager dedicato', 'Research Panel', 'API dati', 'White-label option'],
    cta: 'Contattaci',
    highlight: false,
  },
];

function Advertise() {
  return (
    <div className="adv-page page-enter">
      {/* Header */}
      <header className="adv-header">
        <Link to="/" className="adv-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <img src="/qpe_logo.svg" alt="QPé" className="adv-logo" />
      </header>

      {/* Hero */}
      <section className="adv-hero">
        <div className="adv-hero-badge">Per inserzionisti</div>
        <h1 className="adv-hero-title">Raggiungi il tuo pubblico<br />attraverso le loro scelte</h1>
        <p className="adv-hero-sub">
          QPé è la piattaforma dove le persone esprimono opinioni reali ogni giorno.
          I tuoi annunci si integrano nel momento decisionale — non dopo.
        </p>
        <a href="mailto:info@qpe.app?subject=Advertising QPé" className="adv-hero-cta">
          Parla con noi
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      {/* Stats */}
      <section className="adv-stats">
        {STATS.map(s => (
          <div key={s.label} className="adv-stat">
            <span className="adv-stat-value">{s.value}</span>
            <span className="adv-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Formati */}
      <section className="adv-section">
        <h2 className="adv-section-title">Formati pubblicitari</h2>
        <div className="adv-formats">
          {FORMATS.map(f => (
            <div key={f.name} className="adv-format-card">
              <div className="adv-format-icon">{f.icon}</div>
              <div className="adv-format-body">
                <div className="adv-format-name">
                  {f.name}
                  {f.tag && <span className="adv-format-tag">{f.tag}</span>}
                </div>
                <p className="adv-format-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="adv-section">
        <h2 className="adv-section-title">Piani</h2>
        <div className="adv-packages">
          {PACKAGES.map(p => (
            <div key={p.name} className={`adv-package ${p.highlight ? 'highlight' : ''}`}>
              {p.highlight && <div className="adv-package-badge">Consigliato</div>}
              <div className="adv-package-name">{p.name}</div>
              <div className="adv-package-price">
                {p.price}<span className="adv-package-period">{p.period}</span>
              </div>
              <ul className="adv-package-features">
                {p.features.map(feat => (
                  <li key={feat}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:info@qpe.app?subject=${encodeURIComponent(`Piano ${p.name} - QPé Advertising`)}`}
                className={`adv-package-cta ${p.highlight ? 'primary' : 'secondary'}`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="adv-section">
        <h2 className="adv-section-title">Domande frequenti</h2>
        <div className="adv-faq">
          <div className="adv-faq-item">
            <h3>Come funziona il targeting?</h3>
            <p>Puoi raggiungere utenti per categoria di interesse (sport, musica, tech, ecc.) e fascia demografica. Il targeting è basato sui dati di engagement, non sul tracciamento personale.</p>
          </div>
          <div className="adv-faq-item">
            <h3>Come vengono mostrati gli annunci?</h3>
            <p>I sondaggi sponsorizzati appaiono nel feed con etichetta "Sponsorizzato". Mantengono lo stesso formato dei sondaggi organici per massimizzare l'engagement.</p>
          </div>
          <div className="adv-faq-item">
            <h3>Che dati ricevo nel report?</h3>
            <p>Impressioni, voti raccolti, distribuzione A/B, categorie degli utenti coinvolti, tempo di esposizione medio. I dati sono sempre aggregati e anonimi.</p>
          </div>
          <div className="adv-faq-item">
            <h3>È possibile un test prima di acquistare?</h3>
            <p>Sì, offriamo una campagna prova a prezzo ridotto per valutare i risultati. Contattaci per un preventivo personalizzato.</p>
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="adv-cta-section">
        <h2>Pronto a iniziare?</h2>
        <p>Scrivici per discutere la campagna più adatta al tuo brand.</p>
        <a href="mailto:info@qpe.app?subject=Advertising QPé" className="adv-hero-cta">
          Contatta il team
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </a>
      </section>

      {/* Footer */}
      <footer className="adv-footer">
        <Link to="/">← Torna a QPé</Link>
        <span>© {new Date().getFullYear()} QPé</span>
        <Link to="/privacy-policy">Privacy Policy</Link>
      </footer>
    </div>
  );
}

export default Advertise;
