export default function LikeButton({ likes, liked, onLike }) {
    return (
        <button
            onClick={onLike}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: liked ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                border: '1px solid',
                borderColor: liked ? '#ef4444' : 'var(--border)',
                color: liked ? '#ef4444' : 'var(--text-muted)',
                borderRadius: '8px', padding: '0.3rem 0.7rem',
                cursor: 'pointer', fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                fontWeight: liked ? 600 : 400,
            }}
            title={liked ? 'Unlike' : 'Like'}
        >
            <span style={{ fontSize: '1rem', transition: 'transform 0.2s ease', transform: liked ? 'scale(1.15)' : 'scale(1)' }}>
                {liked ? '❤️' : '🤍'}
            </span>
            <span>{likes}</span>
        </button>
    );
}
