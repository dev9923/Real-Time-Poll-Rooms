import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, options } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.create({
      data: {
        title: question,
        createdBy: uuidv4(),
        options: {
          createMany: {
            data: options.map((text: string, index: number) => ({ text, position: index })),
          },
        },
      },
      include: { options: true },
    });

    const pollId = poll.id;
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/poll/${pollId}`;

    return NextResponse.json(
      { success: true, poll: { id: poll.id, question: poll.title, options: poll.options, shareLink } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pollId = searchParams.get('id');

    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(pollId) },
      include: { options: { include: { votes: true } }, votes: true },
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      poll: {
        id: poll.id,
        question: poll.title,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes.length,
        })),
        totalVotes: poll.votes.length,
      },
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}