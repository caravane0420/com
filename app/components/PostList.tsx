'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { format } from 'date-fns'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PostListProps {
    initialPosts: any[]
    searchParams?: { q?: string; type?: string }
}

export default function PostList({ initialPosts, searchParams }: PostListProps) {
    const q = searchParams?.q || ''
    const type = searchParams?.type || 'title'

    // SWR key includes search params
    const { data: posts } = useSWR(`/api/posts?q=${encodeURIComponent(q)}&type=${type}`, fetcher, {
        fallbackData: initialPosts,
        refreshInterval: 5000,
    })

    // Search Implementation
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const keyword = formData.get('q')
        const searchType = formData.get('type')
        window.location.href = `/?q=${keyword}&type=${searchType}`
    }

    return (
                    <th className="py-2 text-left px-4">제목</th>
                    <th className="py-2 w-28">글쓴이</th>
                    <th className="py-2 w-20 hidden sm:table-cell">날짜</th>
                    <th className="py-2 w-16 hidden sm:table-cell">조회</th>
                    <th className="py-2 w-16 hidden sm:table-cell">추천</th>
                </tr >
            </thead >
        <tbody>
            {posts?.map((post: any, index: number) => (
                <tr key={post.id} className="border-b border-[#eee] hover:bg-[#f9f9f9]">
                    <td className="text-center py-2 text-gray-500 text-xs hidden sm:table-cell">
                        {posts.length - index}
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
                </tr>
            )}
        </tbody>
        </table >
    )
}
