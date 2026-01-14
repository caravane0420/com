'use client'

import { useActionState } from 'react'
import { createEmoticonPack } from '@/app/actions'

export default function CreatePackForm() {
    const [state, action, isPending] = useActionState(createEmoticonPack, null)

    return (
        <form action={action} className="flex gap-2">
            <input
                name="name"
                placeholder="팩 이름 (예: 케장콘)"
                className="border p-2 rounded flex-1"
                required
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-[#3b4890] text-white px-4 py-2 rounded font-bold disabled:opacity-50"
            >
                {isPending ? '생성 중...' : '생성'}
            </button>
            {state?.error && <span className="text-red-500 text-sm flex items-center">{state.error}</span>}
        </form>
    )
}
