import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pollId = parseInt(id);

    try {
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        votes: true
                    }
                }
            }
        });

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // Calculate vote counts
        const optionsWithCounts = poll.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            voteCount: opt.votes.length
        }));

        return NextResponse.json({
            id: poll.id,
            title: poll.title,
            options: optionsWithCounts
        });

    } catch (error) {
        console.error('Error fetching poll:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
