// Profile page — user details, debates, bookmarks, and rank

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDebates, getBookmarks, getLeaderboard, getMe, getUserStats, uploadAvatar } from '../services/api';
import DebateCard from '../components/DebateCard';
import { PageSkeleton } from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Profile() {
    const { user, login } = useAuth();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState('debates');

    // Fetch all profile data with TanStack Query
    const { data: profileData, isLoading } = useQuery({
        queryKey: ['profile', user?._id],
        queryFn: async () => {
            const [debatesRes, bookmarksRes, leaderboardRes, meRes, statsRes] = await Promise.all([
                getDebates({ creator: user?._id, limit: 50 }),
                getBookmarks(),
                getLeaderboard(10),
                getMe(),
                getUserStats(),
            ]);
            return {
                myDebates: debatesRes.data.debates,
                bookmarkedDebates: bookmarksRes.data,
                leaderboard: leaderboardRes.data,
                livePoints: meRes.data.points,
                avatarUrl: meRes.data.avatar || '',
                stats: statsRes.data,
            };
        },
        enabled: !!user,
    });

    const myDebates = profileData?.myDebates ?? [];
    const bookmarkedDebates = profileData?.bookmarkedDebates ?? [];
    const leaderboard = profileData?.leaderboard ?? [];
    const stats = profileData?.stats ?? { debatesCreated: 0, argumentsPosted: 0, votesReceived: 0 };
    const livePoints = profileData?.livePoints ?? user?.points ?? 0;
    const avatarUrl = profileData?.avatarUrl ?? user?.avatar ?? '';

    // Avatar upload mutation
    const avatarMutation = useMutation({
        mutationFn: (formData) => uploadAvatar(formData),
        onSuccess: (res) => {
            login({ ...user, avatar: res.data.avatar });
            queryClient.invalidateQueries({ queryKey: ['profile', user?._id] });
            toast.success('Avatar updated!');
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'Failed to upload avatar';
            toast.error(msg);
        },
    });

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);
        avatarMutation.mutate(formData);
    };

    const tabStyle = (active) => ({
        padding: '0.6rem 1.25rem',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: active ? 'var(--primary)' : 'var(--border)',
        background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        color: active ? 'var(--primary-light)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
    });

    const userRank = leaderboard.findIndex((u) => u._id === user?._id) + 1;

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="glass animate-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={user?.name}
                                style={{
                                    width: '72px', height: '72px', borderRadius: '50%',
                                    objectFit: 'cover', border: '3px solid var(--primary)',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 700, color: 'white',
                            }}>
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <label style={{
                            position: 'absolute', bottom: '-4px', right: '-4px',
                            background: 'var(--primary)', borderRadius: '50%',
                            width: '28px', height: '28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: avatarMutation.isPending ? 'wait' : 'pointer',
                            fontSize: '0.8rem',
                            border: '2px solid var(--surface)',
                            opacity: avatarMutation.isPending ? 0.6 : 1,
                        }}>
                            {avatarMutation.isPending ? '⏳' : '📷'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={avatarMutation.isPending}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.name}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-category">
                                {user?.role === 'admin' ? '👑 Admin' : '🗣️ Debater'}
                            </span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', gap: '1.5rem', textAlign: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                                {livePoints}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                ⭐ Points
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pro-color)' }}>
                                {stats.debatesCreated}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                📝 Debates
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                                {stats.argumentsPosted}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                💬 Arguments
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--con-color)' }}>
                                {stats.votesReceived}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                🗳️ Votes
                            </div>
                        </div>
                        {userRank > 0 && (
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
                                    #{userRank}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    🏆 Rank
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button style={tabStyle(tab === 'debates')} onClick={() => setTab('debates')}>
                    My Debates ({myDebates.length})
                </button>
                <button style={tabStyle(tab === 'bookmarks')} onClick={() => setTab('bookmarks')}>
                    🔖 Bookmarks ({bookmarkedDebates.length})
                </button>
                <button style={tabStyle(tab === 'leaderboard')} onClick={() => setTab('leaderboard')}>
                    🏆 Leaderboard
                </button>
            </div>

            {tab === 'debates' && (
                <>
                    {myDebates.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                You haven't created any debates yet.
                            </p>
                            <Link to="/create" className="btn-primary" style={{ textDecoration: 'none' }}>
                                Start Your First Debate
                            </Link>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1rem',
                        }}>
                            {myDebates.map((d) => (
                                <DebateCard key={d._id} debate={d} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'bookmarks' && (
                <>
                    {bookmarkedDebates.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No bookmarked debates yet.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1rem',
                        }}>
                            {bookmarkedDebates.map((d) => (
                                <DebateCard key={d._id} debate={d} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'leaderboard' && (
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                        🏆 Top Debaters
                    </h3>
                    {leaderboard.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {leaderboard.map((u, idx) => (
                                <div key={u._id} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.75rem 1rem', borderRadius: '10px',
                                    background: u._id === user?._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: u._id === user?._id ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)',
                                }}>
                                    <span style={{
                                        fontSize: '1.1rem', fontWeight: 800, minWidth: '2rem',
                                        color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : 'var(--text-muted)',
                                    }}>
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                    </span>
                                    <span style={{ flex: 1, fontWeight: 600 }}>{u.name}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                                        {u.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
