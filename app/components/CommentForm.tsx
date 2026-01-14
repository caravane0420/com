'use client'

import { useActionState } from 'react'
import { createComment } from '@/app/actions'
import { useEffect, useRef } from 'react'

export default function CommentForm({ postId }: { postId: string }) {
    const [state, action, isPending] = useActionState(createComment, null)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
        }
    }, [state?.success])

    return (
        <form ref={formRef} action={action} className="bg-white border border-[#ccc] p-3">
            <input type="hidden" name="postId" value={postId} />
            <div className="flex gap-2">
                <textarea
                    id="comment"
                    name="content"
                    rows={3}
                    required
                    className="flex-1 resize-none border border-[#ddd] bg-[#fff] p-2 text-sm focus:border-[#3b4890] focus:outline-none"
                    placeholder="Leave a comment..."
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-20 bg-[#3b4890] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#2d3870]"
                >
                    {isPending ? '...' : 'Add'}
                </button>
            </div>
        </form>
    )
}
