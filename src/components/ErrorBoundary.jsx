// ─── Ferhenga Matematîkê — Error Boundary ────────────────────────────────────
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Ferhenga Matematîkê] Xeletî:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100dvh', padding: 32,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: '#F8FAFB', color: '#1A2332', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #0F4C5C, #1A6B7F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', fontFamily: 'serif', marginBottom: 20,
          }}>
            π
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F4C5C', marginBottom: 8 }}>
            Xeletîyek çêbû
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
            Bibore, pirsgirêkek çêbû. Ji kerema xwe dîsa biceribîne.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 32px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #0F4C5C, #1A6B7F)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
          >
            Ji nû ve biceribîne
          </button>
          {this.props.showDetails && this.state.error && (
            <pre style={{
              marginTop: 24, padding: 16, borderRadius: 8,
              background: '#FEF2F2', color: '#991B1B', fontSize: 11,
              maxWidth: '90vw', overflow: 'auto', textAlign: 'left',
              border: '1px solid #FECACA',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
