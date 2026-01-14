'use client'

import { recommendPost } from '@/app/actions'
import { useTransition } from 'react'

export default function RecommendButton({ postId, count }: { postId: string, count: number }) {
    const [isPending, startTransition] = useTransition()

    const handleRecommend = () => {
        startTransition(() => {
            recommendPost(postId)
            alert('추천하였습니다.')
        })
    }

    return (
        <div className="flex justify-center my-8">
            <button
                onClick={handleRecommend}
                disabled={isPending}
                className="flex flex-col items-center justify-center w-24 h-24 border border-[#ccc] bg-[#f4f4f4] hover:bg-[#e0e0e0] rounded-sm transition-colors"
            >
                <span className="text-xl font-bold text-[#3b4890]">⭐</span>
                <span className="text-sm font-bold text-[#333] mt-1">개념</span>
                <span className="text-xs text-gray-500 mt-1">{count}</span>
            </button>
        </div>
    )
}
