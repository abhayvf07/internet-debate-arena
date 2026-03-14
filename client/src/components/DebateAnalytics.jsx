import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DebateAnalytics({ proVotes = 0, conVotes = 0, views = 0, argumentsCount = 0 }) {
    const totalVotes = proVotes + conVotes;

    const data = {
        labels: ['Pro Votes', 'Con Votes'],
        datasets: [
            {
                data: [proVotes, conVotes],
                backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 13
                    }
                }
            },
            tooltip: {
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
            }
        },
        cutout: '70%',
    };

    return (
        <div className="glass animate-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Debate Analytics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                {/* Chart Segment */}
                <div style={{ display: 'flex', justifyContent: 'center', height: '200px' }}>
                    {totalVotes === 0 ? (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            height: '100%', width: '100%', color: 'var(--text-muted)',
                            border: '2px dashed var(--border)', borderRadius: '50%'
                        }}>
                            No votes yet
                        </div>
                    ) : (
                        <Doughnut data={data} options={options} />
                    )}
                </div>

                {/* Metrics Segment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                        background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', 
                        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' 
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Votes</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0' }}>{totalVotes}</div>
                    </div>
                    
                    <div style={{ 
                        background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', 
                        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Views</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#a78bfa' }}>{views}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Arguments</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#60a5fa' }}>{argumentsCount}</div>
                        </div>
                    </div>

                    <div style={{ 
                        background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', 
                        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' 
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Engagement Rate</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#34d399' }}>
                            {views > 0 ? Object.is(NaN, Math.round(((totalVotes + argumentsCount) / views) * 100)) ? '0' : Math.round(((totalVotes + argumentsCount) / views) * 100) : 0}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
