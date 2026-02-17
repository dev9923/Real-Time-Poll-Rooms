import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PollsList() {
    const polls = await prisma.poll.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            _count: {
                select: { votes: true }
            }
        }
    });

    return (
        <div className="container animate-fade-in">
            <h1 style={{
                fontSize: '2rem',
                marginBottom: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
            }}>
                All Polls
            </h1>

            {polls.length === 0 ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>No polls created yet.</p>
                    <Link href="/" className="btn-primary">
                        Create Your First Poll
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {polls.map((poll) => (
                        <Link href={`/polls/${poll.id}`} key={poll.id} style={{ textDecoration: 'none' }}>
                            <div className="card glass option-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    marginBottom: '1rem',
                                    color: 'var(--foreground)',
                                    lineHeight: 1.4
                                }}>
                                    {poll.title}
                                </h2>
                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                    <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                                    <span style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontWeight: 600
                                    }}>
                                        {poll._count.votes} Votes
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
