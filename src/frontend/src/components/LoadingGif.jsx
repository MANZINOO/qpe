import { useTheme } from '../context/ThemeContext';

/**
 * Mostra la GIF di caricamento adatta al tema corrente.
 * - Tema scuro  → loading_white.gif (gif bianca)
 * - Tema chiaro → loading_black.gif (gif nera)
 */
function LoadingGif({ size = 56, style = {} }) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? '/loading_white.gif' : '/loading_black.gif';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 0',
      ...style
    }}>
      <img
        src={src}
        alt="Caricamento..."
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </div>
  );
}

export default LoadingGif;
