import { Link } from 'react-router-dom';
import './PlusSuccess.css';

function PlusSuccess() {
  return (
    <div className="plus-success-page page-enter">
      <div className="plus-success-container">
        <span className="plus-success-star">⭐</span>
        <h1 className="plus-success-title">Benvenuto in QPé Plus!</h1>
        <p className="plus-success-desc">
          Il tuo abbonamento è stato attivato. Il badge ⭐ apparirà sul tuo profilo
          e sui tuoi sondaggi entro pochi secondi.
        </p>
        <Link to="/" className="plus-success-cta">Torna alla home</Link>
        <Link to="/profile" className="plus-success-link">Vedi il tuo profilo</Link>
      </div>
    </div>
  );
}

export default PlusSuccess;
