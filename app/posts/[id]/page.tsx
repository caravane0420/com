import { db } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'
import CommentForm from '@/app/components/CommentForm'
import { getSession } from '@/lib/session'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PostPage(props: PageProps) {
    const params = await props.params;

    const {
        id
    } = params;

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

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {post.title}
                </h1>
                <div className="mt-4 flex items-center gap-2 text-gray-500">
                    <span className="font-medium text-gray-900">{post.author.username}</span>
                    <span>•</span>
                    <time>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</time>
                </div>
            </div>

            <div className="prose prose-zinc max-w-none border-b border-gray-200 pb-8">
                <p className="whitespace-pre-wrap text-lg leading-8 text-gray-700">{post.content}</p>
            </div>

            <div className="pt-8">
                <h2 className="text-lg font-bold text-gray-900">
                    Comments ({post.comments.length})
                </h2>

                <div className="mt-6 space-y-6">
                    {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-x-4">
                            <div className="flex-auto rounded-xl bg-gray-50 p-4">
                                <div className="flex justify-between gap-x-4">
                                    <div className="font-semibold text-gray-900">{comment.author.username}</div>
                                    <time className="text-xs text-gray-500">
                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                    </time>
                                </div>
                                <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                    {post.comments.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
                    )}
                </div>

                {session ? (
                    <CommentForm postId={post.id} />
                ) : (
                    <div className="mt-6 rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
                        Please <a href="/login" className="underline hover:text-black">login</a> to comment.
                    </div>
                )}
            </div>
        </div>
    )
}
