import LikeButton from './VoteButtons';
import ReplySection from './ReplySection';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportArgument, deleteArgument } from '../services/api';
import toast from 'react-hot-toast';

export default function ArgumentCard({ argument, liked, onLike, onReplyAdded }) {
    const { user } = useAuth();
    const [showReport, setShowReport] = useState(false);
    const [reason, setReason] = useState('');
    const [reported, setReported] = useState(false);

    const isPro = argument.side === 'Pro';
    const isOwnArgument = user && argument.author?._id === user._id;

    const handleReport = async () => {
        if (!reason.trim()) return;
        try {
            await reportArgument({ argumentId: argument._id, reason });
            setReported(true);
            setShowReport(false);
        } catch (err) {
            console.error('Report failed:', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            await deleteArgument(argument._id);
            toast.success("Argument deleted");
            if (onReplyAdded) onReplyAdded(); // Triggers a refetch
        } catch (err) {
            toast.error("Failed to delete");
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="glass animate-in" style={{
            padding: '1.25rem',
            borderLeft: `3px solid ${isPro ? 'var(--pro-color)' : 'var(--con-color)'}`,
            marginBottom: '1rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                        {argument.text}
                    </p>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        fontSize: '0.8rem', color: 'var(--text-muted)',
                    }}>
                        <span>{argument.author?.name || 'Unknown'}</span>
                        <span>·</span>
                        <span>{new Date(argument.createdAt).toLocaleDateString()}</span>
                        <span className={`badge ${isPro ? 'badge-pro' : 'badge-con'}`}>
                            {argument.side}
                        </span>
                    </div>
                </div>

                {/* Like button — hidden for own arguments */}
                {user && !isOwnArgument && (
                    <LikeButton
                        likes={argument.likes}
                        liked={liked}
                        onLike={() => onLike(argument._id)}
                    />
                )}

                {/* Show like count for own arguments + Delete button */}
                {isOwnArgument && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                            fontSize: '0.85rem', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                        }}>
                            ❤️ {argument.likes}
                        </span>
                        <button 
                            onClick={handleDelete}
                            style={{ 
                                background: 'transparent', border: 'none', 
                                color: '#f87171', cursor: 'pointer', fontSize: '0.9rem', padding: 0
                            }}
                            title="Delete argument"
                        >
                            🗑️
                        </button>
                    </div>
                )}

                {/* Show count for guests */}
                {!user && argument.likes > 0 && (
                    <span style={{
                        fontSize: '0.85rem', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}>
                        ❤️ {argument.likes}
                    </span>
                )}
            </div>

            {/* Report */}
            {user && !reported && !isOwnArgument && (
                <div style={{ marginTop: '0.5rem' }}>
                    {!showReport ? (
                        <button
                            onClick={() => setShowReport(true)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: 'var(--text-muted)', cursor: 'pointer',
                                fontSize: '0.75rem',
                            }}
                        >
                            🚩 Report
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <input
                                className="input-field"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason for reporting..."
                                style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            />
                            <button onClick={handleReport} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                                Submit
                            </button>
                            <button onClick={() => setShowReport(false)} className="btn-ghost" style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}>
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            )}
            {reported && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>✓ Reported</span>}

            {/* Replies */}
            <ReplySection
                argumentId={argument._id}
                replies={argument.replies || []}
                onReplyAdded={onReplyAdded}
            />
        </div>
    );
}
