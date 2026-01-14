import { verifySession, getSession } from '@/lib/session'
import WriteForm from '@/app/components/WriteForm'

export default async function WritePage() {
    const session = await getSession()

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6 border-b-2 border-[#3b4890] pb-2">
                <h1 className="text-xl font-bold text-[#3b4890]">글쓰기</h1>
            </div>
            <WriteForm user={session} />
        </div>
    )
}
