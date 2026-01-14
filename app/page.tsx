import { db } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'

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
    <div>
      <div className="flex items-center justify-between mb-2 border-b-2 border-[#3b4890] pb-2">
        <h2 className="text-[#3b4890] font-bold text-lg">All Posts</h2>
        <Link href="/write" className="dc-btn font-bold">Write</Link>
      </div>

      <table className="w-full text-sm table-fixed border-collapse">
        <thead className="bg-[#f9f9f9] border-b border-[#ccc] text-gray-600 text-center">
          <tr>
            <th className="py-2 w-16 hidden sm:table-cell">No</th>
            <th className="py-2 text-left px-4">Title</th>
            <th className="py-2 w-28">Author</th>
            <th className="py-2 w-24 hidden sm:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-[#eee] hover:bg-[#f9f9f9]">
              <td className="text-center py-2 text-gray-500 text-xs hidden sm:table-cell">
                -
              </td>
              <td className="py-2 px-4 whitespace-nowrap overflow-hidden text-ellipsis">
                <Link href={`/posts/${post.id}`} className="hover:underline text-[#333]">
                  {post.title}
                </Link>
                {post._count.comments > 0 && (
                  <span className="ml-1 text-[#ff0000] text-xs font-bold">
                    [{post._count.comments}]
                  </span>
                )}
                {post.imageUrl && (
                  <span className="ml-1 text-gray-400 text-xs">📷</span>
                )}
              </td>
              <td className="text-center py-2 truncate break-all px-1 cursor-pointer" title={post.author.username}>
                {post.author.username}
              </td>
              <td className="text-center py-2 text-gray-500 text-xs hidden sm:table-cell">
                {format(post.createdAt, 'MM-dd')}
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td colSpan={4} className="py-12 text-center text-gray-500">
                No posts yet. Be the first to write!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <Link href="/write" className="dc-btn">Write</Link>
      </div>
    </div>
  )
}
