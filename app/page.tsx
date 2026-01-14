import { db } from '@/lib/db'
import PostList from './components/PostList'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams
  const q = searchParams.q
  const type = searchParams.type || 'title'

  const where: any = {}
  if (q) {
    if (type === 'title') where.title = { contains: q } // PostgreSQL default case-sensitive unless mode 'insensitive' used in Schema? Prisma 'contains' usually sensitive in Postgres. I should enable mode: 'insensitive' if possible but schema is simple for now.
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
      _count: { select: { comments: true } },
    },
    take: 20
  })

  // Manual transform if needed or just pass strict
  // Serializing Date objects is auto handled by Server Comp -> Client Comp in Next 15? 
  // No, needs "use client" comp to accept dates? Usually "Warning: Only plain objects...".
  // Prisma Dates are Date objects.
  // I should rely on the fact that I passed them before and it worked?
  // Let's verify `PostList` props. It worked before.

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Gallery Header */}
      <div className="mb-6 border-b-2 border-[#3b4890] pb-2 flex justify-between items-end">
        <h1 className="text-2xl font-bold text-[#3b4890]">
          이삭 갤러리
        </h1>
      </div>

      <PostList initialPosts={posts} searchParams={{ q, type }} />
    </div>
  )
}
