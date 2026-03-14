import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getLeaderboard(50);
                setLeaders(res.data);
            } catch (err) {
                console.error('Failed to load leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner text="Loading leaderboard..." />;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-in">
                <h1 style={{
                    fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444, #a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    🏆 Leaderboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Top debaters ranked by reputation points
                </p>
            </div>

            {leaders.length === 0 ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No debaters yet. Be the first!</p>
                </div>
            ) : (
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {leaders.map((u, idx) => (
                            <div
                                key={u._id}
                                className="animate-in"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.85rem 1.25rem', borderRadius: '12px',
                                    background: u._id === user?._id
                                        ? 'rgba(99, 102, 241, 0.12)'
                                        : idx < 3 ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: u._id === user?._id
                                        ? 'rgba(99, 102, 241, 0.3)'
                                        : 'var(--border)',
                                    animationDelay: `${idx * 0.05}s`,
                                }}
                            >
                                {/* Rank */}
                                <span style={{
                                    fontSize: idx < 3 ? '1.5rem' : '1.1rem',
                                    fontWeight: 800,
                                    minWidth: '2.5rem',
                                    textAlign: 'center',
                                    color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : 'var(--text-muted)',
                                }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </span>

                                {/* Avatar */}
                                {u.avatar ? (
                                    <img src={u.avatar} alt="" style={{
                                        width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover',
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', fontWeight: 700, color: 'white',
                                    }}>
                                        {u.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}

                                {/* Name */}
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                                        {u.name}
                                        {u._id === user?._id && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginLeft: '0.5rem' }}>
                                                (You)
                                            </span>
                                        )}
                                    </span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Joined {new Date(u.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Points */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontWeight: 800, fontSize: '1.15rem',
                                        color: idx === 0 ? '#f59e0b' : 'var(--primary-light)',
                                    }}>
                                        {u.points}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        points
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
