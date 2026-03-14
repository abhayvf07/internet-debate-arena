import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/?q=${encodeURIComponent(searchInput.trim())}`);
            setSearchInput('');
        }
    };

    return (
        <nav className="glass" style={{
            position: 'sticky', top: 0, zIndex: 50,
            padding: '0.75rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            gap: '1rem',
        }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <span style={{ fontSize: '1.5rem' }}>⚔️</span>
                <span style={{
                    fontSize: '1.15rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Debate Arena
                </span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{
                display: 'flex', gap: '0.5rem', flex: '0 1 340px',
            }}>
                <input
                    className="input-field"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search debates..."
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    🔍
                </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="btn-ghost"
                    style={{ fontSize: '1.1rem', padding: '0.4rem 0.6rem' }}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Leaderboard link */}
                <Link to="/leaderboard" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                    🏆
                </Link>

                {user ? (
                    <>
                        <Link to="/create" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                            + New Debate
                        </Link>
                        <Link to="/profile" className="btn-ghost" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt=""
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : null}
                            {user.name}
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="btn-ghost" style={{ textDecoration: 'none', color: '#f59e0b' }}>
                                Admin
                            </Link>
                        )}
                        <button onClick={handleLogout} className="btn-ghost">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
