import { useState } from 'react';
import { replyToArgument, deleteArgument } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReplySection({ argumentId, replies = [], onReplyAdded }) {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            await replyToArgument({ parentId: argumentId, text });
            setText('');
            setShowForm(false);
            if (onReplyAdded) onReplyAdded();
        } catch (err) {
            console.error('Reply failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            await deleteArgument(replyId);
            toast.success("Reply deleted");
            if (onReplyAdded) onReplyAdded();
        } catch (err) {
            toast.error("Failed to delete reply");
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: '0.75rem' }}>
            {/* Replies list */}
            {replies.length > 0 && (
                <div style={{
                    borderLeft: '2px solid var(--border)',
                    paddingLeft: '1rem', marginBottom: '0.5rem',
                }}>
                    {replies.map((reply) => (
                        <div key={reply._id} style={{
                            padding: '0.5rem 0', fontSize: '0.85rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}>
                            <div>
                                <p style={{ color: 'var(--text)', lineHeight: 1.4 }}>{reply.text}</p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    — {reply.author?.name || 'Unknown'} · {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            {user && user._id === reply.author?._id && (
                                <button 
                                    onClick={() => handleDeleteReply(reply._id)}
                                    style={{ 
                                        background: 'transparent', border: 'none', 
                                        color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', padding: 0,
                                        marginLeft: '0.5rem'
                                    }}
                                    title="Delete reply"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Reply toggle */}
            {user && (
                <>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--primary-light)', cursor: 'pointer',
                            fontSize: '0.8rem', padding: 0,
                        }}
                    >
                        {showForm ? 'Cancel' : '↩ Reply'}
                    </button>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="input-field"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Write a reply..."
                                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                            />
                            <button type="submit" className="btn-primary" disabled={loading}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                {loading ? '...' : 'Send'}
                            </button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}
