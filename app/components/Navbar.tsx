import Link from 'next/link'
import { getSession } from '@/lib/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
    const session = await getSession()

    return (
        <header className="bg-[#3b4890] border-b border-[#2b3875] text-white mb-4">
            <div className="mx-auto max-w-[1000px] h-12 flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
                        <span className="text-yellow-300 font-extrabold">DC</span>Friends
                    </Link>
                    <nav className="flex gap-4 text-sm font-bold text-gray-200">
                        <Link href="/" className="hover:text-white">이삭 갤러리</Link>
                        <Link href="#" className="hover:text-white opacity-50 cursor-not-allowed">마이너 갤러리</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    {session ? (
                        <>
                            <span className="text-gray-300 text-xs">{session.username}님</span>
                            <Link href="/write" className="hover:underline">글쓰기</Link>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:underline">로그인</Link>
                            <Link href="/register" className="hover:underline">회원가입</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
