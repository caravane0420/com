import { db } from "@/lib/db"

export default async function AdminDashboard() {
    const [postCount, commentCount, reportCount, banCount] = await Promise.all([
        db.post.count(),
        db.comment.count(),
        db.report.count({ where: { status: 'PENDING' } }),
        db.ban.count(),
    ])

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="전체 게시글" value={postCount} icon="📝" color="bg-blue-500" />
                <StatCard title="전체 댓글" value={commentCount} icon="💬" color="bg-green-500" />
                <StatCard title="처리 대기 신고" value={reportCount} icon="🚨" color="bg-red-500" />
                <StatCard title="차단된 내역" value={banCount} icon="🚫" color="bg-gray-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Could add recent activity here later */}
                <div className="bg-white p-6 rounded shadow-sm">
                    <h3 className="font-bold mb-4">관리자 메모</h3>
                    <textarea className="w-full border p-2 rounded h-32 text-sm" placeholder="개발 노트..."></textarea>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${color} text-white rounded-full flex items-center justify-center text-xl`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    )
}
