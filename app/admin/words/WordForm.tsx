'use client'

import { useActionState } from "react"
import { addForbiddenWord } from "../actions"

export default function WordForm() {
    const [state, action, isPending] = useActionState(addForbiddenWord, null)

    return (
        <form action={action} className="flex gap-2">
            <input
                name="word"
                className="border p-2 rounded flex-1 text-sm"
                placeholder="금지할 단어 입력"
                required
            />
            <button disabled={isPending} className="bg-[#3b4890] text-white px-4 py-2 rounded font-bold text-sm disabled:opacity-50 h-10">
                추가
            </button>
            {state?.error && <p className="text-red-500 text-xs self-center">{state.error}</p>}
        </form>
    )
}
