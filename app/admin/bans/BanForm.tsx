'use client'

import { useActionState } from "react"
import { addBan } from "../actions"

export default function BanForm() {
    const [state, action, isPending] = useActionState(addBan, null)

    return (
        <form action={action} className="flex gap-2 items-end">
            <div>
                <label className="block text-xs font-bold mb-1">Type</label>
                <select name="type" className="border p-2 rounded text-sm h-10">
                    <option value="IP">IP Address</option>
                    <option value="USER">User ID</option>
                </select>
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold mb-1">Value (IP or ID)</label>
                <input name="value" className="border p-2 rounded w-full text-sm h-10" placeholder="127.0.0.1 or uuid" required />
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold mb-1">Reason</label>
                <input name="reason" className="border p-2 rounded w-full text-sm h-10" placeholder="Spamming..." />
            </div>
            <button disabled={isPending} className="bg-red-600 text-white px-4 py-2 rounded font-bold h-10 disabled:opacity-50">
                차단
            </button>
            {state?.error && <p className="text-red-500 text-xs">{state.error}</p>}
        </form>
    )
}
