'use client'

import { logout } from '@/app/actions'

export default function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="text-sm font-medium hover:text-gray-900 text-gray-500"
        >
            Log out
        </button>
    )
}
