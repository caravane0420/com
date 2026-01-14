'use client'

import { useActionState } from 'react'
import { addEmoticon } from '@/app/actions'

export default function AddEmoticonForm({ packId }: { packId: string }) {
    // Bind packId so the action receives it as first arg, but wait...
    // addEmoticon is (packId, prevState, formData).
    // If I bind(null, packId), it becomes (prevState, formData). Perfect for useActionState.
    const bindAction = addEmoticon.bind(null, packId)
    const [state, action, isPending] = useActionState(bindAction, null)

    return (
        <form action={action} className="bg-gray-50 p-4 rounded flex gap-2 items-center">
            <span className="text-sm font-bold">이미지 추가:</span>
            <input type="file" name="image" required className="text-sm" />
            <button
                disabled={isPending}
                className="bg-gray-600 text-white px-3 py-1 text-sm rounded disabled:opacity-50"
            >
                {isPending ? '업로드 중...' : '업로드'}
            </button>
            {state?.error && <span className="text-red-500 text-xs">{state.error}</span>}
        </form>
    )
}
