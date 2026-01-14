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
        <form ref={formRef} action={action} className="mt-6 flex gap-4">
            <input type="hidden" name="postId" value={postId} />
            <div className="flex-1">
                <label htmlFor="comment" className="sr-only">
                    Add a comment
                </label>
                <textarea
                    id="comment"
                    name="content"
                    rows={3}
                    required
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Add a comment..."
                />
            </div>
            <button
                type="submit"
                disabled={isPending}
                className="h-fit rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
                {isPending ? 'Posting...' : 'Post'}
            </button>
        </form>
    )
}
