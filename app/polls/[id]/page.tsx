import { prisma } from '@/lib/prisma';
import PollClient from './PollClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Next.js 13+ generateMetadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pollId = parseInt(id);
    if (isNaN(pollId)) return { title: 'Poll Not Found' };

    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
    });

    return {
        title: poll ? `Poll: ${poll.title}` : 'Poll Not Found',
    };
}

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pollId = parseInt(id);

    if (isNaN(pollId)) {
        notFound();
    }

    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            options: {
                include: {
                    votes: true // To count initial votes. Optimization: aggregate count query
                }
            }
        }
    });

    if (!poll) {
        notFound();
    }

    // Transform data for client to avoid sending entire votes array if large
    // though for simple app it's fine.
    const serializedPoll = {
        id: poll.id,
        title: poll.title,
        options: poll.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: [], // don't send individual votes due to size/privacy, send count
            voteCount: opt.votes.length
        }))
    };

    return <PollClient initialPoll={serializedPoll} />;
}
