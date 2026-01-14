'use client'

import { useActionState, useState, useRef } from 'react'
import { createPost } from '@/app/actions'
import EmoticonPicker from './EmoticonPicker'

export const dynamic = 'force-dynamic'

interface WriteFormProps {
    user?: { userId: string; username: string } | null
}

export default function WriteForm({ user }: WriteFormProps) {
    const [state, action, isPending] = useActionState(createPost, null)
    const [content, setContent] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleEmoticonSelect = (url: string) => {
        const markdown = `\n![sticker](${url})\n`
        setContent(prev => prev + markdown)
        // Ideally insert at cursor, but append is safe fallback for now
    }

    return (
        <form action={action} className="w-full max-w-2xl mx-auto space-y-4">
            {state?.errors && (
                <div className="bg-red-50 text-red-600 p-3 text-sm rounded border border-red-200">
                    입력 내용을 확인해주세요.
                </div>
            )}

            {!user && (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">닉네임</label>
                        <input
                            name="nickname"
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                            placeholder="닉네임"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                            placeholder="비밀번호"
                            required
                        />
                    </div>
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
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="content" className="block text-sm font-bold text-gray-700">내용</label>
                    <EmoticonPicker onSelect={handleEmoticonSelect} />
                </div>
                <textarea
                    id="content"
                    name="content"
                    ref={textareaRef}
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#3b4890] focus:border-[#3b4890] outline-none"
                    placeholder="내용을 입력하세요"
                />
                {state?.errors?.content && <p className="text-red-500 text-xs mt-1">{state.errors.content}</p>}
            </div>

            {/* Image upload */}
            <div className="p-4 border border-gray-200 bg-gray-50 rounded">
                <label className="block text-sm font-bold text-gray-700 mb-2">대표 이미지 첨부</label>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#3b4890] file:text-white hover:file:bg-[#2d3870]"
                />
                <p className="text-xs text-gray-500 mt-2">또는 이미지 URL 입력:</p>
                <input
                    type="text"
                    name="imageUrl"
                    className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                    placeholder="https://..."
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
