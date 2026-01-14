import Link from 'next/link'
import { getSession } from '@/lib/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
    const session = await getSession()

    return (
        <header className="bg-[#3b4890] border-b border-[#2b3875] text-white mb-4">
            <div className="mx-auto max-w-[1000px] h-12 flex items-center justify-between px-4">
                <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
                    <span className="text-yellow-300 font-extrabold">DC</span>Friends
                </Link>

                <div className="flex items-center gap-4 text-sm">
                    {session ? (
                        <>
                            <Link href="/write" className="hover:underline">Write Post</Link>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:underline">Login</Link>
                            <Link href="/register" className="hover:underline">Join</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
