export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '4rem 2rem',
        }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{
                marginTop: '1rem', color: 'var(--text-muted)',
                fontSize: '0.9rem',
            }}>
                {text}
            </p>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
