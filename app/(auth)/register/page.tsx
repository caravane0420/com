'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions'
import Link from 'next/link'

export default function RegisterPage() {
    const [state, action, isPending] = useActionState(signup, null)

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-sm text-gray-500">Join our friend group</p>
                </div>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium leading-none">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="username"
                        />
                        {state?.errors?.username && (
                            <p className="text-sm text-red-500">{state.errors.username[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <button
                        disabled={isPending}
                        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isPending ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <div className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-black hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
