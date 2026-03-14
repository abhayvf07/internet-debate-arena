import { useState, useEffect } from 'react';
import { getReports, resolveReport, adminGetUsers, adminDeleteDebate, adminDeleteArgument, adminBanUser, adminGetStats } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalDebates: 0, pendingReports: 0 });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('reports');

    const fetchReports = async () => {
        try {
            const res = await getReports();
            setReports(res.data);
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await adminGetUsers({ limit: 50 });
            setUsers(res.data.users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await adminGetStats();
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchReports(), fetchUsers(), fetchStats()]);
            setLoading(false);
        };
        load();
    }, []);

    const handleResolve = async (reportId) => {
        try {
            await resolveReport(reportId);
            toast.success('Report resolved');
            fetchReports();
            fetchStats();
        } catch (err) {
            toast.error('Failed to resolve report');
            console.error('Failed to resolve report:', err);
        }
    };

    const handleDeleteArgument = async (argId) => {
        if (!window.confirm('Delete this argument?')) return;
        try {
            await adminDeleteArgument(argId);
            toast.success('Argument deleted');
            fetchReports();
        } catch (err) {
            toast.error('Failed to delete argument');
        }
    };

    const handleBanUser = async (userId) => {
        if (!window.confirm('Toggle ban for this user?')) return;
        try {
            const res = await adminBanUser(userId);
            toast.success(res.data.message);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to ban user');
        }
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

    const statCardStyle = {
        flex: 1,
        minWidth: '200px',
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
    };

    if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }} className="animate-in">
                🛡️ Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Manage users, reports, and content.
            </p>

            {/* Stats Overview */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                        {stats.totalUsers}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total Users</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                        {stats.totalDebates}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total Debates</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: stats.pendingReports > 0 ? '#f87171' : 'var(--text-muted)' }}>
                        {stats.pendingReports}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Pending Reports</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button style={tabStyle(tab === 'reports')} onClick={() => setTab('reports')}>
                    🚩 Reports ({reports.length})
                </button>
                <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>
                    👥 Users ({users.length})
                </button>
            </div>

            {/* Reports Tab */}
            {tab === 'reports' && (
                <>
                    {reports.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                ✅ No pending reports. All clear!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reports.map((report) => (
                                <div key={report._id} className="glass animate-in" style={{ padding: '1.5rem' }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem',
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reported argument:</span>
                                                <p style={{
                                                    fontSize: '0.95rem', lineHeight: 1.5, marginTop: '0.25rem',
                                                    padding: '0.75rem', background: 'rgba(0,0,0,0.2)',
                                                    borderRadius: '8px', borderLeft: '3px solid var(--con-color)',
                                                }}>
                                                    "{report.argumentId?.text || 'Deleted argument'}"
                                                </p>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    by {report.argumentId?.author?.name || 'Unknown'}
                                                </span>
                                            </div>

                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason:</span>
                                                <p style={{ fontSize: '0.9rem', color: '#f87171', marginTop: '0.15rem' }}>
                                                    {report.reason}
                                                </p>
                                            </div>

                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                Reported by {report.userId?.name} · {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                            <button
                                                onClick={() => handleResolve(report._id)}
                                                className="btn-primary"
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                ✓ Resolve
                                            </button>
                                            {report.argumentId && (
                                                <button
                                                    onClick={() => handleDeleteArgument(report.argumentId._id)}
                                                    className="btn-ghost"
                                                    style={{ fontSize: '0.85rem', color: 'var(--con-color)' }}
                                                >
                                                    🗑️ Delete Arg
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {users.map((u) => (
                            <div key={u._id} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.75rem 1rem', borderRadius: '10px',
                                border: '1px solid var(--border)',
                                opacity: u.isBanned ? 0.6 : 1,
                            }}>
                                {u.avatar ? (
                                    <img src={u.avatar} alt="" style={{
                                        width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover',
                                        filter: u.isBanned ? 'grayscale(1)' : 'none'
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: u.isBanned ? '#475569' : 'linear-gradient(135deg, var(--primary), #a78bfa)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 700, color: 'white',
                                    }}>
                                        {u.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {u.name}
                                        {u.isBanned && <span style={{ fontSize: '0.7rem', color: '#f87171', border: '1px solid #f87171', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>BANNED</span>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                </div>
                                <span className={`badge ${u.role === 'admin' ? 'badge-category' : 'badge-tag'}`}>
                                    {u.role}
                                </span>
                                <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.9rem', marginRight: '1rem' }}>
                                    {u.points} pts
                                </span>
                                {u.role !== 'admin' && (
                                    <button 
                                        onClick={() => handleBanUser(u._id)}
                                        className="btn-ghost" 
                                        style={{ 
                                            fontSize: '0.8rem', 
                                            padding: '0.4rem 0.8rem',
                                            color: u.isBanned ? '#34d399' : '#f87171',
                                            borderColor: u.isBanned ? '#34d399' : '#f87171',
                                        }}
                                    >
                                        {u.isBanned ? 'Unban' : 'Ban'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
