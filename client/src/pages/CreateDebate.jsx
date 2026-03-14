import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDebate } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Technology', 'Politics', 'Society', 'Economy',
    'Education', 'Environment', 'Science', 'Ethics',
    'Business', 'Entertainment', 'Health', 'Sports', 'Other',
];

export default function CreateDebate() {
    const [form, setForm] = useState({ title: '', description: '', category: 'Other', tags: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await createDebate({
                title: form.title,
                description: form.description,
                category: form.category,
                tags: form.tags,
            });
            toast.success('Debate created!');
            navigate(`/debate/${res.data._id}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create debate';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1.5rem' }}>
            <div className="glass animate-in" style={{ padding: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Start a Debate
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Propose a topic and let the community argue both sides.
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
                            Title
                        </label>
                        <input
                            className="input-field"
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g., AI will replace most jobs within 10 years"
                            required
                            maxLength={150}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                            Description
                        </label>
                        <textarea
                            className="input-field"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Provide context, background info, and the exact position to be debated..."
                            required
                            maxLength={2000}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                            Category
                        </label>
                        <select
                            className="input-field"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            style={{ cursor: 'pointer' }}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                            Tags
                        </label>
                        <input
                            className="input-field"
                            type="text"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="e.g., AI, Jobs, Future"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
                        {loading ? 'Creating...' : '🚀 Launch Debate'}
                    </button>
                </form>
            </div>
        </div>
    );
}
