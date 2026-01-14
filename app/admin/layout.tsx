import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    // 1. Verify Session
    if (!session) {
        redirect("/")
    }

    // 2. Verify Role (Double check with DB to be safe)
    const user = await db.user.findUnique({
        where: { id: session.userId },
    })

    if (!user || user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#3b4890] text-white flex-shrink-0">
                <div className="p-6 border-b border-[#2d3870]">
                    <h1 className="text-xl font-bold">관리자 페이지</h1>
                    <p className="text-xs text-gray-300 mt-1">Dev Dashboard</p>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin" className="block px-4 py-2 hover:bg-[#2d3870] rounded">
                        📊 대시보드
                    </Link>
                    <Link href="/admin/reports" className="block px-4 py-2 hover:bg-[#2d3870] rounded">
                        🚨 신고 관리
                    </Link>
                    <Link href="/admin/bans" className="block px-4 py-2 hover:bg-[#2d3870] rounded">
                        🚫 차단 관리 (IP/User)
                    </Link>
                    <Link href="/admin/words" className="block px-4 py-2 hover:bg-[#2d3870] rounded">
                        🤬 금지어 관리
                    </Link>
                    <Link href="/admin/emoticons" className="block px-4 py-2 hover:bg-[#2d3870] rounded">
                        😀 이모티콘 관리
                    </Link>
                    <div className="border-t border-[#2d3870] my-2"></div>
                    <Link href="/" className="block px-4 py-2 hover:bg-[#2d3870] rounded text-gray-300">
                        🏠 커뮤니티 홈
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
