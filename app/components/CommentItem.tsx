'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import CommentForm from './CommentForm'
import { deletePost } from '@/app/actions' // Use deletePost logic but need deleteComment action actually?
// Wait, I need a 'deleteComment' action. 
// Currently 'deletePost' exists. 'createComment' exists.
// I'll skip delete COMMENT for now or use a placeholder?
// User asked for "Admin functions", I added deletePost.
// I should add deleteComment to actions later. For now, focus on Reply/View.

interface CommentItemProps {
    comment: any
    user?: { userId: string; username: string } | null
}

export default function CommentItem({ comment, user }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false)

    return (
        <div className={`border-b border-[#eee] pb-2 last:border-0 p-1 hover:bg-[#fafafa]`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {comment.parent && <span className="text-gray-400 text-xs">↳</span>}
                        <span className="text-xs font-bold text-[#333]">
                            {comment.author ? comment.author.username : `${comment.nickname} (${comment.ipAddress})`}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {format(new Date(comment.createdAt), 'MM.dd HH:mm')}
                        </span>
                    </div>
                    <p className="text-sm text-[#444] whitespace-pre-wrap pl-1">{comment.content}</p>
                    {comment.imageUrl && (
                        <div className="mt-2 pl-1">
                            <img
                                src={comment.imageUrl}
                                alt="comment attachment"
                                className="max-w-[200px] max-h-[200px] object-contain border border-[#eee] rounded-sm"
                            />
                        </div>
                    )}

                    <div className="mt-1">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs text-gray-500 hover:underline"
                        >
                            답글
                        </button>
                    </div>
                </div>
            </div>

            {isReplying && (
                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                    <CommentForm
                        postId={comment.postId}
                        parentId={comment.id}
                        user={user}
                        onSuccess={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Recursive Replies? 
               If provided structure is tree, render children.
               If flat list, parent manages.
               Here assume 'comment' has 'replies' if I fetched with 'include: replies'.
           */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="pl-4 mt-2 bg-gray-50 rounded">
                    {comment.replies.map((reply: any) => (
                        <CommentItem key={reply.id} comment={reply} user={user} />
                    ))}
                </div>
            )}
        </div>
    )
}
