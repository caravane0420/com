import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const posts = await db.post.findMany({
        include: {
            author: { select: { username: true } },
            _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(posts)
}
