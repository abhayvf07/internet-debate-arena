import { Link } from 'react-router-dom';
import { formatDate } from '../utils/helpers';

export default function DebateCard({ debate, showTrending = false }) {
    const date = formatDate(debate.createdAt);

    return (
        <Link to={`/debate/${debate._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass glass-hover animate-in" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-category">{debate.category || 'Other'}</span>
                    {showTrending && debate.trendingScore !== undefined && (
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                            🔥 {Math.round(debate.trendingScore)}
                        </span>
                    )}
                </div>

                {/* Tags */}
                {debate.tags && debate.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {debate.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="badge badge-tag" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                                {tag}
                            </span>
                        ))}
                        {debate.tags.length > 3 && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{debate.tags.length - 3}</span>
                        )}
                    </div>
                )}

                <h3 style={{
                    fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem',
                    lineHeight: 1.3,
                }}>
                    {debate.title}
                </h3>

                <p style={{
                    fontSize: '0.875rem', color: 'var(--text-muted)',
                    lineHeight: 1.5, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {debate.description}
                </p>

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.8rem', color: 'var(--text-muted)',
                }}>
                    <span>by {debate.creator?.name || 'Unknown'}</span>
                    <span>{date}</span>
                </div>

                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                    {debate.argumentsCount !== undefined && (
                        <span>💬 {debate.argumentsCount} args</span>
                    )}
                    {(debate.proVotes !== undefined || debate.conVotes !== undefined) && (
                        <span>🗳️ {(debate.proVotes || 0) + (debate.conVotes || 0)} votes</span>
                    )}
                    {debate.views !== undefined && debate.views > 0 && (
                        <span>👁️ {debate.views}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
