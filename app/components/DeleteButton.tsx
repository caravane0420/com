'use client'

import { deletePost } from '@/app/actions'

export default function DeleteButton({ postId }: { postId: string }) {
    return (
        <form action={() => {
            if (confirm('정말 삭제하시겠습니까?')) {
                deletePost(postId)
            }
        }}>
            <button
                type="submit"
                className="px-3 py-1 border border-[#ccc] text-xs bg-[#f9f9f9] hover:bg-red-50 hover:text-red-600 text-gray-600"
            >
                삭제
            </button>
        </form>
    )
}
