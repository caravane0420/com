'use client'

import { logout } from '@/app/actions'

export default function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="text-sm hover:underline hover:text-gray-200 text-white"
        >
            Logout
        </button>
    )
}
