'use client';

import { useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';

type Option = {
    id: number;
    text: string;
    votes: any[];
    voteCount: number;
};

type Poll = {
    id: number;
    title: string;
    options: Option[];
};

export default function PollClient({ initialPoll }: { initialPoll: Poll }) {
    const [poll, setPoll] = useState<Poll>(initialPoll);
    const [voterId, setVoterId] = useState<string>('');
    const [hasVoted, setHasVoted] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        let id = localStorage.getItem('poll_voter_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('poll_voter_id', id);
        }
        setVoterId(id);
    }, []);

    useEffect(() => {
        const socket = io();

        socket.on('connect', () => {
            console.log('Connected to socket', socket.id);
            setSocketConnected(true);
            socket.emit('joinPoll', poll.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            setSocketConnected(false);
        });

        socket.on('newVote', ({ optionId }) => {
            setPoll((prev) => {
                const newOptions = prev.options.map((opt) => {
                    if (opt.id === optionId) {
                        return {
                            ...opt,
                            voteCount: opt.voteCount + 1,
                        };
                    }
                    return opt;
                });

                // Show toast
                const votedOption = prev.options.find(o => o.id === optionId);
                if (votedOption) {
                    setToast(`New vote: ${votedOption.text}`);
                    setTimeout(() => setToast(''), 3000);
                }

                return { ...prev, options: newOptions };
            });
        });

        return () => {
            socket.emit('leavePoll', poll.id);
            socket.disconnect();
        };
    }, [poll.id]);

    const totalVotes = useMemo(() => {
        return poll.options.reduce((acc, curr) => acc + curr.voteCount, 0);
    }, [poll.options]);

    const handleVote = async (optionId: number) => {
        if (!voterId) return;

        try {
            const res = await fetch(`/api/polls/${poll.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId, voterId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setErrorMessage(errorData.error || 'Failed to vote');
                return;
            }

            setHasVoted(true);
            setErrorMessage('');
        } catch (err) {
            console.error(err);
            setErrorMessage('Error submitting vote. Check your connection.');
        }
    };

    const copyToClipboard = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopySuccess('Link copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div className="card glass" style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        {poll.title}
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        <span>{totalVotes} Votes</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: socketConnected ? '#22c55e' : '#f59e0b',
                                display: 'inline-block'
                            }}></span>
                            {socketConnected ? 'Live' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                {errorMessage && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1.5rem',
                        border: '1px solid #fca5a5',
                        textAlign: 'center'
                    }}>
                        {errorMessage}
                    </div>
                )}

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {poll.options.map((opt) => {
                        const percentage = totalVotes > 0 ? ((opt.voteCount / totalVotes) * 100).toFixed(1) : '0';
                        const isLeading = totalVotes > 0 && opt.voteCount === Math.max(...poll.options.map(o => o.voteCount));

                        return (
                            <div
                                key={opt.id}
                                className="option-card"
                                style={{
                                    position: 'relative',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden',
                                    backgroundColor: 'white',
                                    cursor: hasVoted ? 'default' : 'pointer',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: hasVoted ? 'none' : 'var(--shadow-sm)'
                                }}
                                onClick={() => !hasVoted && handleVote(opt.id)}
                                onMouseEnter={(e) => !hasVoted && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                                onMouseLeave={(e) => !hasVoted && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                            >
                                {/* Progress Bar */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${percentage}%`,
                                        backgroundColor: isLeading ? '#dbeafe' : '#f1f5f9', // Blue tint for winner
                                        zIndex: 0,
                                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />

                                {/* Content */}
                                <div style={{ position: 'relative', zIndex: 1, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--foreground)' }}>{opt.text}</span>
                                        {isLeading && totalVotes > 0 && <span title="Leading" style={{ fontSize: '1.2rem' }}>🏆</span>}
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: isLeading ? '#2563eb' : 'var(--foreground)' }}>
                                            {percentage}%
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                                            {opt.voteCount} votes
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action / Share Section */}
                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Share this Poll
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            readOnly
                            value={typeof window !== 'undefined' ? window.location.href : ''}
                            className="input-field"
                            style={{ flex: 1, color: 'var(--muted)', fontSize: '0.9rem' }}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <button
                            onClick={copyToClipboard}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                        >
                            <span>{copySuccess ? '✓' : 'Copy'}</span>
                        </button>
                    </div>
                    {copySuccess && <p style={{ color: '#22c55e', fontSize: '0.9rem', marginTop: '0.5rem' }}>{copySuccess}</p>}
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        backgroundColor: '#1e293b',
                        color: 'white',
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        animation: 'fadeIn 0.3s ease-out forwards',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>✨</span>
                        <span style={{ fontWeight: 500 }}>{toast}</span>
                    </div>
                )}

            </div>
        </div>
    );
}
