import { db } from "@/lib/db"
import { deleteForbiddenWord } from "../actions"
import WordForm from "./WordForm"

export const dynamic = 'force-dynamic'

export default async function WordsPage() {
    const words = await db.forbiddenWord.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">금지어 관리</h2>

            <div className="bg-white p-6 rounded shadow-sm mb-6">
                <h3 className="font-bold mb-4">금지어 추가</h3>
                <WordForm />
            </div>

            <div className="bg-white p-6 rounded shadow-sm">
                <h3 className="font-bold mb-4">금지어 목록 ({words.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {words.map((w: any) => (
                        <div key={w.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                            <span>{w.word}</span>
                            <form action={async () => {
                                'use server'
                                await deleteForbiddenWord(w.id)
                            }}>
                                <button className="text-red-500 font-bold hover:text-red-700">×</button>
                            </form>
                        </div>
                    ))}
                    {words.length === 0 && <p className="text-gray-400">등록된 금지어가 없습니다.</p>}
                </div>
            </div>
        </div>
    )
}
