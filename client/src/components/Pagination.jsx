export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.5rem',
            marginTop: '2rem', flexWrap: 'wrap',
        }}>
            <button
                className="btn-ghost"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
            >
                ← Prev
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: p === page ? 'var(--primary)' : 'var(--border)',
                        background: p === page ? 'var(--primary)' : 'transparent',
                        color: p === page ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {p}
                </button>
            ))}

            <button
                className="btn-ghost"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                style={{ opacity: page >= totalPages ? 0.4 : 1 }}
            >
                Next →
            </button>
        </div>
    );
}
