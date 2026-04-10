import SignatureDemo from './components/SignatureDemo'

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: '#f0f2f5',
    color: '#1a1a2e',
    maxWidth: 960,
    margin: '0 auto',
    padding: '1.5rem',
  },
  header: { flexShrink: 0, paddingBottom: '1rem' },
  headerInner: { display: 'flex', alignItems: 'baseline', gap: '0.75rem' },
  h1: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
  badge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.15rem 0.5rem',
    borderRadius: 999,
    background: '#e8f0fe',
    color: '#1a73e8',
    letterSpacing: '0.02em',
  },
}

function App() {
  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <h1>Signature Kit</h1>
          <span style={styles.badge}>React Playground</span>
        </div>
      </div>
      <SignatureDemo />
    </div>
  )
}

export default App
