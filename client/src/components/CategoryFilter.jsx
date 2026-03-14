const CATEGORIES = [
    'All',
    'Technology',
    'Politics',
    'Education',
    'Science',
    'Entertainment',
    'Health',
    'Sports',
    'Other',
];

export default function CategoryFilter({ selected, onSelect }) {
    return (
        <div style={{
            display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
            marginBottom: '1.5rem',
        }}>
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat === 'All' ? '' : cat)}
                    style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '999px',
                        border: '1px solid',
                        borderColor: (cat === 'All' && !selected) || selected === cat
                            ? 'var(--primary)' : 'var(--border)',
                        background: (cat === 'All' && !selected) || selected === cat
                            ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: (cat === 'All' && !selected) || selected === cat
                            ? 'var(--primary-light)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
