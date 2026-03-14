import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginUser(form);
            login(res.data);
            toast.success(`Welcome back, ${res.data.name}!`);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '420px', margin: '4rem auto', padding: '0 1.5rem',
        }}>
            <div className="glass animate-in" style={{ padding: '2.5rem' }}>
                <h1 style={{
                    fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem',
                    textAlign: 'center',
                }}>
                    Welcome Back
                </h1>
                <p style={{
                    textAlign: 'center', color: 'var(--text-muted)',
                    marginBottom: '2rem', fontSize: '0.9rem',
                }}>
                    Log in to join the debate
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px', padding: '0.75rem',
                        marginBottom: '1rem', fontSize: '0.85rem', color: '#f87171',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                            Email
                        </label>
                        <input
                            className="input-field"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                            Password
                        </label>
                        <input
                            className="input-field"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', marginTop: '1.5rem',
                    fontSize: '0.85rem', color: 'var(--text-muted)',
                }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
