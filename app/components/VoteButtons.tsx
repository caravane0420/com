'use client'

import { recommendPost, downvotePost } from '@/app/actions'
import { useTransition } from 'react'

export default function VoteButtons({ postId, up, down }: { postId: string, up: number, down: number }) {
    const [isPending, startTransition] = useTransition()

    const handleRecommend = () => {
        startTransition(async () => {
            const res = await recommendPost(postId)
            alert(res.message)
        })
    }

    const handleDownvote = () => {
        startTransition(async () => {
            const res = await downvotePost(postId)
            alert(res.message)
        })
    }

    return (
        <div className="flex justify-center gap-4 my-8">
            <button
                onClick={handleRecommend}
                disabled={isPending}
                className="flex flex-col items-center justify-center w-24 h-24 border border-[#ccc] bg-[#f4f4f4] hover:bg-[#e0e0e0] rounded-sm transition-colors relative"
            >
                <span className="text-xl font-bold text-[#3b4890]">⭐</span>
                <span className="text-sm font-bold text-[#333] mt-1">개념</span>
                <span className="text-xs text-gray-500 mt-1">{up}</span>
            </button>

            <button
                onClick={handleDownvote}
                disabled={isPending}
                className="flex flex-col items-center justify-center w-24 h-24 border border-[#ccc] bg-[#f4f4f4] hover:bg-[#e0e0e0] rounded-sm transition-colors"
            >
                <span className="text-xl font-bold text-gray-500">👎</span>
                <span className="text-sm font-bold text-[#333] mt-1">비추</span>
                <span className="text-xs text-gray-500 mt-1">{down}</span>
            </button>
        </div>
    )
}
