import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  await prisma.vote.create({
    data:{
      pollId:body.pollId,
      optionId:body.optionId,
      ip: body.ip
    }
  })

  global.io.emit("vote_update", body.pollId)

  return NextResponse.json({success:true})
}
