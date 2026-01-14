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

    const { data: posts } = useSWR(`/api/posts?q=${encodeURIComponent(q)}&type=${type}`, fetcher, {
        fallbackData: initialPosts,
        refreshInterval: 5000,
    })

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const keyword = formData.get('q')
        const searchType = formData.get('type')
        window.location.href = `/?q=${keyword}&type=${searchType}`
    }

    return (
        <div className="w-full">
            <table className="w-full text-sm table-fixed border-collapse">
                <thead className="bg-[#f9f9f9] border-b border-[#ccc] text-gray-600 text-center">
                    <tr>
                        <th className="py-2 w-12 hidden sm:table-cell">번호</th>
                        <th className="py-2 text-left px-4">제목</th>
                        <th className="py-2 w-28">글쓴이</th>
                        <th className="py-2 w-20 hidden sm:table-cell">날짜</th>
                        <th className="py-2 w-16 hidden sm:table-cell">조회</th>
                        <th className="py-2 w-16 hidden sm:table-cell">추천</th>
                    </tr>
                </thead>
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
                                {post.nickname || post.author.username}
                            </td>
                            <td className="text-center py-2 text-gray-500 text-xs hidden sm:table-cell">
                                {format(new Date(post.createdAt), 'MM.dd')}
                            </td>
                            <td className="text-center py-2 text-gray-500 text-xs hidden sm:table-cell">
                                {post.viewCount}
                            </td>
                            <td className="text-center py-2 text-gray-500 text-xs hidden sm:table-cell">
                                {post.upCount}
                            </td>
                        </tr>
                    ))}
                    {posts?.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-12 text-center text-gray-500">
                                등록된 글이 없습니다. 첫 번째 글을 작성해보세요!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex justify-end mt-4">
                <Link
                    href="/write"
                    className="bg-[#3b4890] text-white px-4 py-2 text-sm font-bold rounded hover:bg-[#2d3870]"
                >
                    글쓰기
                </Link>
            </div>

            <form onSubmit={handleSearch} className="flex justify-center gap-2 mt-8 mb-4 bg-[#f4f4f4] p-3 rounded">
                <select name="type" defaultValue={type} className="border border-[#ccc] p-1 text-sm">
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                    <option value="author">글쓴이</option>
                </select>
                <input
                    name="q"
                    defaultValue={q}
                    className="border border-[#ccc] p-1 text-sm w-64"
                    placeholder="검색어 입력"
                />
                <button className="bg-[#3b4890] text-white px-3 py-1 text-sm font-bold">검색</button>
            </form>
        </div>
    )
}
