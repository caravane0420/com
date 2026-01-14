import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import CreatePackForm from '@/app/components/admin/CreatePackForm'
import AddEmoticonForm from '@/app/components/admin/AddEmoticonForm'
import { deleteEmoticonPack, deleteEmoticon } from '@/app/actions'

export default async function AdminEmoticonsPage() {
    // Check Admin
    try {
        const session = await verifySession()
        const user = await db.user.findUnique({ where: { id: session.userId } })
        if (user?.role !== 'ADMIN') {
            return <div>접근 권한이 없습니다. (관리자 전용)</div>
        }
    } catch (e) {
        redirect('/login')
    }

    const packs = await db.emoticonPack.findMany({
        include: { emoticons: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-2xl font-bold text-[#3b4890] mb-8">🛠️ 디시콘(이모티콘) 관리자</h1>

            <div className="bg-white p-6 border rounded shadow-sm mb-10">
                <h2 className="font-bold mb-4">새 이모티콘 팩 만들기</h2>
                <CreatePackForm />
            </div>

            <div className="space-y-8">
                {packs.map(pack => (
                    <div key={pack.id} className="bg-white p-6 border rounded shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg">{pack.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{pack.emoticons.length}개</span>
                                <form action={async () => {
                                    'use server'
                                    await deleteEmoticonPack(pack.id)
                                }}>
                                    <button type="submit" className="text-red-500 hover:text-red-700 text-sm border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                        팩 삭제
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-4 mb-4">
                            {pack.emoticons.map(emo => (
                                <div key={emo.id} className="relative group">
                                    <img src={emo.imageUrl} className="w-full h-auto border rounded p-1" />
                                    <form action={async () => {
                                        'use server'
                                        await deleteEmoticon(emo.id)
                                    }} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="submit" className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600" title="삭제">
                                            ×
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>

                        <AddEmoticonForm packId={pack.id} />
                    </div>
                ))}
            </div>
        </div>
    )
}
