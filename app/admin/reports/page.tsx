import { db } from "@/lib/db"
import { resolveReport } from "../actions"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const reports = await db.report.findMany({
        where: { status: 'PENDING' },
        include: { reporter: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">신고 관리 (처리 대기)</h2>

            <div className="bg-white p-6 rounded shadow-sm">
                <div className="space-y-4">
                    {reports.map((report: any) => (
                        <div key={report.id} className="border border-gray-200 p-4 rounded bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold mr-2">
                                        {report.targetType}
                                    </span>
                                    <span className="font-bold text-gray-700 mr-2">
                                        Reason: {report.reason}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                        by {report.reporter?.username || 'Unknown'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(report.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <div className="bg-white p-2 border rounded text-sm text-gray-600 mb-3">
                                Details: {report.details || 'N/A'} <br />
                                Target ID: {report.targetId}
                            </div>

                            <div className="flex gap-2 justify-end">
                                <form action={async () => {
                                    'use server'
                                    await resolveReport(report.id, 'DELETE_CONTENT')
                                }}>
                                    <button className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700">
                                        삭제 및 승인
                                    </button>
                                </form>
                                <form action={async () => {
                                    'use server'
                                    await resolveReport(report.id, 'RESOLVE')
                                }}>
                                    <button className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700">
                                        유지 및 승인 (삭제안함)
                                    </button>
                                </form>
                                <form action={async () => {
                                    'use server'
                                    await resolveReport(report.id, 'DISMISS')
                                }}>
                                    <button className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600">
                                        기각
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <p className="text-center text-gray-500 py-10">대기 중인 신고가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
