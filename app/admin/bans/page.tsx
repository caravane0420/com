import { db } from "@/lib/db"
import BanForm from "./BanForm"
import { deleteBan } from "../actions"

export const dynamic = 'force-dynamic'

export default async function BansPage() {
    const bans = await db.ban.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">차단 관리</h2>

            <div className="bg-white p-6 rounded shadow-sm mb-6">
                <h3 className="font-bold mb-4">새 차단 추가</h3>
                <BanForm />
            </div>

            <div className="bg-white p-6 rounded shadow-sm">
                <h3 className="font-bold mb-4">차단 목록 ({bans.length})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 border-b">
                            <tr>
                                <th className="p-3">Type</th>
                                <th className="p-3">Value</th>
                                <th className="p-3">Reason</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bans.map((ban: any) => (
                                <tr key={ban.id} className="border-b">
                                    <td className="p-3 font-bold">{ban.type}</td>
                                    <td className="p-3">{ban.value}</td>
                                    <td className="p-3 text-gray-500">{ban.reason || '-'}</td>
                                    <td className="p-3">{new Date(ban.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <form action={async () => {
                                            'use server'
                                            await deleteBan(ban.id)
                                        }}>
                                            <button className="text-red-600 hover:underline">해제</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {bans.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-400">차단 내역이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
