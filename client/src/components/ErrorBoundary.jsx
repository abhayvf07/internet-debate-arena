// Error boundary — catches React render errors and shows a recovery UI

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
                    color: '#e2e8f0',
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    padding: '2rem',
                }}>
                    <div style={{
                        maxWidth: '520px',
                        width: '100%',
                        textAlign: 'center',
                        background: 'rgba(30, 30, 60, 0.85)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '3rem 2rem',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Something went wrong
                        </h1>
                        <p style={{
                            color: '#94a3b8',
                            marginBottom: '2rem',
                            lineHeight: 1.6,
                        }}>
                            An unexpected error occurred. Please try reloading the page.
                        </p>

                        {/* Dev-only error details */}
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                textAlign: 'left',
                                marginBottom: '2rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '1rem',
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    color: '#f87171',
                                    fontWeight: 600,
                                    marginBottom: '0.5rem',
                                }}>
                                    Error Details (dev only)
                                </summary>
                                <pre style={{
                                    fontSize: '0.75rem',
                                    color: '#fca5a5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseOver={(e) => e.target.style.opacity = 0.85}
                                onMouseOut={(e) => e.target.style.opacity = 1}
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#e2e8f0',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseOver={(e) => e.target.style.opacity = 0.85}
                                onMouseOut={(e) => e.target.style.opacity = 1}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
