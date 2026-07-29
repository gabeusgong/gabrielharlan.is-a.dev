import { Component, type ErrorInfo, type ReactNode } from 'react'

/* Last-resort guard: if a render throws, show a small on-brand fallback with a
   reload, instead of a blank white page. */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div
        role="alert"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#f4ecd8',
          color: '#211b14',
        }}
      >
        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          Something broke on this page. 🦇
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.6em 1.2em',
            border: '2px solid #211b14',
            borderRadius: '100px',
            background: 'transparent',
            font: 'inherit',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    )
  }
}
