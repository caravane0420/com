'use client'

import { useActionState, useState, useRef, startTransition } from 'react'
import { createPost } from '@/app/actions'
import { upload } from '@vercel/blob/client'
import EmoticonPicker from './EmoticonPicker'

export const dynamic = 'force-dynamic'

interface WriteFormProps {
    user?: { userId: string; username: string } | null
}

interface ActionState {
    errors?: Record<string, string[] | undefined>
    fields?: Record<string, string>
}

export default function WriteForm({ user }: WriteFormProps) {
    const [state, action, isPending] = useActionState(createPost as any, null as ActionState | null)
    const [content, setContent] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        } else {
            setPreviewUrl(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isPending || isUploading) return

        const formData = new FormData(e.currentTarget)
        const file = formData.get('image') as File

        // Disable file upload on server side by removing it from formData if we handle it here
        // But we need to upload it first

        if (file && file.size > 0 && file.name) {
            setIsUploading(true)
            try {
                const newBlob = await upload(file.name, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                })
                formData.set('imageUrl', newBlob.url)
                formData.delete('image') // Don't send file to server
            } catch (err) {
                console.error(err)
                alert('이미지 업로드에 실패했습니다.')
                setIsUploading(false)
                return
            }
            setIsUploading(false)
        }

        startTransition(() => {
            (action as any)(formData)
        })
    }

    const handleEmoticonSelect = (url: string) => {
        const markdown = `\n![sticker](${url})\n`
        setContent(prev => prev + markdown)
        // Ideally insert at cursor, but append is safe fallback for now
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
            {state?.errors && (
                <div className="bg-red-50 text-red-600 p-3 text-sm rounded border border-red-200">
                    입력 내용을 확인해주세요.
                </div>
            )}

            {(!user || state?.errors?.nickname) && (
                <div className="flex flex-col gap-2">
                    {user && state?.errors?.nickname && (
                        <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded">
                            ⚠️ 로그인 세션이 만료되었거나 확인되지 않습니다. 비회원으로 등록하려면 아래 정보를 입력하세요.
                        </div>
                    )}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">닉네임</label>
                            <input
                                name="nickname"
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none text-sm"
                                placeholder="닉네임"
                                defaultValue={state?.fields?.nickname ?? ''}
                                required
                            />
                            {state?.errors?.nickname && <p className="text-red-500 text-xs mt-1">{state.errors.nickname}</p>}
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
                            {state?.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password}</p>}
                        </div>
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
                    defaultValue={state?.fields?.title ?? ''}
                    required
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
                    required
                />
                {state?.errors?.content && <p className="text-red-500 text-xs mt-1">{state.errors.content}</p>}
            </div>

            {/* Image upload */}
            <div className="p-4 border border-gray-200 bg-gray-50 rounded">
                <label className="block text-sm font-bold text-gray-700 mb-2">대표 이미지 첨부</label>
                {previewUrl && (
                    <div className="mb-4 relative inline-block">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-48 rounded border border-gray-300"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setPreviewUrl(null);
                                // Reset file input logic would require ref, but for now just visual clear
                                // Ideally we clear the input value too.
                                const input = document.querySelector('input[name="image"]') as HTMLInputElement;
                                if (input) input.value = '';
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
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
                    disabled={isPending || isUploading}
                    className="bg-[#3b4890] text-white px-6 py-2 rounded font-bold hover:bg-[#2d3870] disabled:opacity-50"
                >
                    {isUploading ? '업로드 중...' : isPending ? '저장 중...' : '등록완료'}
                </button>
            </div>
        </form>
    )
}
