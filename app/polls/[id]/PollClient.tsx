'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';

type Option = {
    id: number;
    text: string;
    votes?: any[]; // Keep for compatibility if needed
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
    const [isLive, setIsLive] = useState(false); // Replaces socketConnected
    const [copySuccess, setCopySuccess] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // --- 1. Initialize Voter ID ---
    useEffect(() => {
        let id = localStorage.getItem('poll_voter_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('poll_voter_id', id);
        }
        setVoterId(id);
        setIsLive(true); // Treat as "connected" once mounted
    }, []);

    // --- 2. Polling Logic (Serverless Real-Time) ---
    // Fetch latest poll data every 2 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/polls/${poll.id}`);
                if (res.ok) {
                    const latestPoll = await res.json();

                    // Only update if data changed (simple check)
                    setPoll((prev) => {
                        // A rigorous deep comparison could be better, but we just overwrite for now
                        // to ensure vote counts are always current.
                        // We preserve the structure to avoid UI flicker.
                        return latestPoll;
                    });
                }
            } catch (err) {
                console.error("Polling error", err);
                // Don't show error to user, just skip this update
            }
        }, 2000); // 2 seconds poll interval

        return () => clearInterval(interval);
    }, [poll.id]);


    // --- 3. Derived State ---
    const totalVotes = useMemo(() => {
        return poll.options.reduce((acc, curr) => acc + curr.voteCount, 0);
    }, [poll.options]);

    // --- 4. Vote Handler ---
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

            // Optimistic update (optional, or just wait for next poll)
            // waiting for next poll is safer for consistency

        } catch (err) {
            console.error(err);
            setErrorMessage('Error submitting vote. Check your connection.');
        }
    };

    // --- 5. Share Handler ---
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
                                backgroundColor: isLive ? '#22c55e' : '#f59e0b',
                                display: 'inline-block',
                                animation: isLive ? 'pulse 2s infinite' : 'none'
                            }}></span>
                            {isLive ? 'Live Updates' : 'Connecting...'}
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
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { opacity: 0.6; transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}</style>
        </div>
    );
}
