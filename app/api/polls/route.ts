import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { title, options } = json;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'Title and at least 2 options are required' }, { status: 400 });
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          create: options.map((opt: string) => ({ text: opt })),
        },
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}