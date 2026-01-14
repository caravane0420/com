import { db } from '@/lib/db'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import CommentForm from '@/app/components/CommentForm'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import ViewIncrementer from '@/app/components/ViewIncrementer'
import VoteButtons from '@/app/components/VoteButtons'
import DeleteButton from '@/app/components/DeleteButton'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PostPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;

    const [post, session] = await Promise.all([
        db.post.findUnique({
            where: { id: id },
            include: {
                author: true,
                comments: {
                    include: { author: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        }),
        getSession(),
    ])

    if (!post) {
        notFound()
    }

    const canDelete = session && (post.authorId === session.userId);

    return (
        <div className="flex flex-col min-h-[500px]">
            <ViewIncrementer postId={id} />

            {/* Header */}
            <div className="border-b-2 border-[#3b4890] pb-3 mb-4">
                <h1 className="text-xl font-bold text-[#333] mb-1">
                    {post.title}
                </h1>
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#333]">{post.author.username}</span>
                        <span className="text-gray-300">|</span>
                        <span>{format(post.createdAt, 'yyyy.MM.dd HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>조회 {post.viewCount}</span>
                        <span>추천 {post.upCount}</span>
                        <span>비추 {post.downCount}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[200px] mb-10 text-sm leading-relaxed text-[#333] p-2">
                {post.imageUrl && (
                    <div className="mb-4">
                        <img
                            src={post.imageUrl}
                            alt="attachment"
                            className="max-w-full h-auto border border-[#eee]"
                        />
                    </div>
                )}
                <div className="markdown-body">
                    <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={{
                            img: (props) => <img {...props} className="max-w-full h-auto inline-block" style={{ maxHeight: '400px' }} />
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Vote Buttons (Recommend / Downvote) */}
            <VoteButtons postId={post.id} up={post.upCount} down={post.downCount} />

            {/* Buttons */}
            <div className="flex justify-end gap-2 border-b border-[#ccc] pb-4 mb-4">
                <Link href="/" className="px-3 py-1 border border-[#ccc] text-xs bg-[#f9f9f9] hover:bg-white text-gray-600">
                    목록
                </Link>
                {canDelete && (
                    <DeleteButton postId={post.id} />
                )}
            </div>

            {/* Comments */}
            <div className="bg-[#f9f9f9] border border-[#ddd] p-4">
                <div className="flex items-center gap-2 mb-3 border-b border-[#eee] pb-2">
                    <span className="font-bold text-[#3b4890] text-sm">전체 댓글</span>
                    <span className="text-red-600 font-bold text-sm">{post.comments.length}개</span>
                </div>

                <div className="space-y-2 mb-6">
                    {post.comments.map((comment) => (
                        <div key={comment.id} className="flex justify-between items-start border-b border-[#eee] pb-2 last:border-0 hover:bg-[#eee] transition-colors p-1">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-[#333]">{comment.author.username}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {format(comment.createdAt, 'MM.dd HH:mm')}
                                    </span>
                                </div>
                                <p className="text-sm text-[#444] whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                    {post.comments.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-4">
                            등록된 댓글이 없습니다.
                        </div>
                    )}
                </div>

                {/* Comment Form */}
                {session ? (
                    <CommentForm postId={post.id} />
                ) : (
                    <div className="bg-white border border-[#ddd] p-3 text-center text-xs text-gray-500">
                        댓글을 작성하려면 <Link href="/login" className="text-blue-600 underline">로그인</Link>이 필요합니다.
                    </div>
                )}
            </div>
        </div>
    )
}
