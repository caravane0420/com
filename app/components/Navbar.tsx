import Link from 'next/link'
import { getSession } from '@/lib/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
    const session = await getSession()

    return (
        <nav className="border-b border-gray-200 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
                    Our Space
                </Link>
                <div className="flex items-center gap-6">
                    {session ? (
                        <>
                            <span className="text-sm text-gray-500 hidden sm:block">Welcome back</span>
                            <Link
                                href="/write"
                                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                New Post
                            </Link>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
