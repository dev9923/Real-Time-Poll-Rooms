import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const pollId = parseInt(id);
        const { optionId, voterId } = await req.json();

        // Anti-abuse: Check if user already voted (by ID or IP)
        // For simplicity, we assume voterId is sent from client (localStorage key)
        // In production, use req.ip or heavy fingerprinting. Here we rely on client-sent ID + simple IP check potentially if available.

        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        // Anti-abuse: Check if user already voted (by ID or IP)
        const existingVote = await prisma.vote.findFirst({
            where: {
                pollId,
                OR: [
                    { voterId: voterId },
                    { voterIp: ip as string }
                ]
            }
        });

        if (existingVote) {
            return NextResponse.json({ error: 'You has already voted in this poll.' }, { status: 403 });
        }

        const vote = await prisma.vote.create({
            data: {
                pollId,
                optionId,
                voterId,
                voterIp: ip as string
            },
            include: {
                option: true
            }
        });

        // Emit socket event (Removed: Client uses SWR Polling now)
        // const io = (global as any).io;
        // if (io) {
        //     io.to(`poll-${pollId}`).emit('newVote', {
        //         optionId,
        //         pollId
        //     });
        // }

        return NextResponse.json(vote);
    } catch (error) {
        console.error('Error voting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
