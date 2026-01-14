'use client'

import { useActionState } from 'react'
import { createPost } from '@/app/actions'

export default function WritePage() {
    const [state, action, isPending] = useActionState(createPost, null)

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Create a new post</h1>
                <p className="text-sm text-gray-500">Share something with the group</p>
            </div>
            <form action={action} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium leading-none">
                        Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="What's on your mind?"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium leading-none">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        required
                        rows={8}
                        className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
                        placeholder="Write your thoughts..."
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isPending}
                        className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isPending ? 'Publishing...' : 'Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    )
}
