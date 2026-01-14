'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { createComment } from '@/app/actions'

interface CommentFormProps {
    postId: string
    parentId?: string | null
    user?: { userId: string; username: string } | null
    onSuccess?: () => void
}

export default function CommentForm({ postId, parentId, user, onSuccess }: CommentFormProps) {
    const [state, action, isPending] = useActionState(createComment, null)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
            onSuccess?.()
        }
    }, [state?.success, onSuccess])

    return (
        <form ref={formRef} action={action} className="bg-white border border-[#ccc] p-3 mb-2">
            <input type="hidden" name="postId" value={postId} />
            {parentId && <input type="hidden" name="parentId" value={parentId} />}

            {!user && (
                <div className="flex gap-2 mb-2">
                    <input
                        name="nickname"
                        className="border border-[#ddd] p-1 text-xs w-32 focus:border-[#3b4890] outline-none"
                        placeholder="닉네임"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        className="border border-[#ddd] p-1 text-xs w-32 focus:border-[#3b4890] outline-none"
                        placeholder="비밀번호"
                        required
                    />
                </div>
            )}

            <div className="flex gap-2">
                <textarea
                    name="content"
                    rows={3}
                    required
                    className="flex-1 resize-none border border-[#ddd] bg-[#fff] p-2 text-sm focus:border-[#3b4890] focus:outline-none"
                    placeholder="댓글을 입력하세요..."
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-20 bg-[#3b4890] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#2d3870]"
                >
                    {isPending ? '등록중' : '등록'}
                </button>
            </div>
            {state?.errors?.content && <p className="text-red-500 text-xs mt-1">{state.errors.content}</p>}
        </form>
    )
}
