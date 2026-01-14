import { db } from '@/lib/db'
import Link from 'next/link'
import PostList from '@/app/components/PostList'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const posts = await db.post.findMany({
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize dates to strings for Client Component validation if needed,
  // but usually Date objects pass from Server Component to Client Component in Next 13+ (flight data).
  // However, SWR fetcher returns strings. To match, we might want to ensure consistency.
  // Prisma Dates are Date objects. JSON.stringify turns them to strings.
  // Next.js passes them as Date objects or strings depending on version. 15+ usually fine.
  // I will check if any warning occurs. For now pass raw.

  return (
    <div>
      <div className="flex items-center justify-between mb-2 border-b-2 border-[#3b4890] pb-2">
        <h2 className="text-[#3b4890] font-bold text-xl">자유 갤러리</h2>
        <Link href="/write" className="dc-btn font-bold">글쓰기</Link>
      </div>

      <PostList initialPosts={posts} />

      <div className="mt-4 flex justify-end">
        <Link href="/write" className="dc-btn">글쓰기</Link>
      </div>
    </div>
  )
}
