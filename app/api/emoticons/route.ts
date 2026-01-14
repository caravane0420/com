import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const packs = await db.emoticonPack.findMany({
        include: { emoticons: true },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(packs)
}
