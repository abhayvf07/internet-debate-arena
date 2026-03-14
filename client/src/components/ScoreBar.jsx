export default function ScoreBar({ proScore, conScore }) {
    const total = proScore + conScore;
    const proPercent = total === 0 ? 50 : Math.round((proScore / total) * 100);
    const conPercent = 100 - proPercent;

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
            }}>
                <span style={{ color: 'var(--pro-color)' }}>
                    👍 Pro {proPercent}% ({proScore} votes)
                </span>
                <span style={{ color: 'var(--con-color)' }}>
                    ({conScore} votes) {conPercent}% Con 👎
                </span>
            </div>

            <div className="score-bar-track">
                <div
                    className="score-bar-fill"
                    style={{ width: `${proPercent}%` }}
                />
            </div>

            {total > 0 && (
                <p style={{
                    textAlign: 'center', marginTop: '0.5rem',
                    fontSize: '0.85rem', fontWeight: 600,
                    color: proScore > conScore ? 'var(--pro-color)' :
                        conScore > proScore ? 'var(--con-color)' : 'var(--text-muted)',
                }}>
                    {proScore > conScore ? '🏆 Pro is winning!' :
                        conScore > proScore ? '🏆 Con is winning!' :
                            "It's a tie!"}
                </p>
            )}
        </div>
    );
}
