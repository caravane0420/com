import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const posts = await db.post.findMany({
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Latest Posts</h1>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-gray-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg text-gray-900">{post.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{post.author.username}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                </div>
              </div>
              {post._count.comments > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {post._count.comments} comments
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {post.content}
            </p>
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get the conversation started.</p>
            <div className="mt-6">
              <Link
                href="/write"
                className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              >
                Create Post
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
