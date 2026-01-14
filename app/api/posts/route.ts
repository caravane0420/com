import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const type = searchParams.get('type') || 'title'

    const where: any = {}
    if (q) {
        if (type === 'title') where.title = { contains: q }
        else if (type === 'content') where.content = { contains: q }
        else if (type === 'author') {
            where.OR = [
                { author: { username: { contains: q } } },
                { nickname: { contains: q } }
            ]
        }
    }

    const posts = await db.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            _count: { select: { comments: true } }
        },
        take: 20
    })

    return NextResponse.json(posts)
}
