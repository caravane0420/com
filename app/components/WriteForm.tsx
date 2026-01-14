'use client'

import { useActionState } from 'react'
import { createPost } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default function WriteForm() {
    const [state, action, isPending] = useActionState(createPost, null)

    return (
        <form action={action} className="w-full max-w-2xl mx-auto space-y-4">
            {state?.errors && (
                <div className="bg-red-50 text-red-600 p-3 text-sm rounded border border-red-200">
                    입력 내용을 확인해주세요.
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#3b4890] focus:border-[#3b4890] outline-none"
                    placeholder="제목을 입력하세요"
                />
                {state?.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title}</p>}
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-1">내용</label>
                <textarea
                    id="content"
                    name="content"
                    rows={12}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#3b4890] focus:border-[#3b4890] outline-none"
                    placeholder="내용을 입력하세요"
                />
                {state?.errors?.content && <p className="text-red-500 text-xs mt-1">{state.errors.content}</p>}
            </div>

            {/* Image upload placeholder */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">이미지 (URL)</label>
                <input
                    type="text"
                    name="imageUrl"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="이미지 URL을 입력하세요 (선택)"
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#3b4890] text-white px-6 py-2 rounded font-bold hover:bg-[#2d3870] disabled:opacity-50"
                >
                    {isPending ? '저장 중...' : '등록완료'}
                </button>
            </div>
        </form>
    )
}
