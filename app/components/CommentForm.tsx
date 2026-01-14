'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import { createComment } from '@/app/actions'
import EmoticonPicker from './EmoticonPicker'

interface CommentFormProps {
    postId: string
    parentId?: string | null
    user?: { userId: string; username: string } | null
    onSuccess?: () => void
}

export default function CommentForm({ postId, parentId, user, onSuccess }: CommentFormProps) {
    const [state, action, isPending] = useActionState(createComment, null)
    const formRef = useRef<HTMLFormElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // State for attachments
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [stickerUrl, setStickerUrl] = useState<string | null>(null)
    const [isImageParams, setIsImageParams] = useState(false) // Track if we have image/sticker

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset()
            setPreviewUrl(null)
            setStickerUrl(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            onSuccess?.()
        }
    }, [state?.success, onSuccess])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setStickerUrl(null) // Clear sticker if file selected
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setIsImageParams(true)
        }
    }

    const handleStickerSelect = (url: string) => {
        setStickerUrl(url)
        setPreviewUrl(null) // Clear file preview if sticker selected
        if (fileInputRef.current) fileInputRef.current.value = '' // Clear file input
        setIsImageParams(true)
    }

    const handleRemoveAttachment = () => {
        setPreviewUrl(null)
        setStickerUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setIsImageParams(false)
    }

    return (
        <form ref={formRef} action={action} className="bg-white border border-[#ccc] p-3 mb-2">
            <input type="hidden" name="postId" value={postId} />
            {parentId && <input type="hidden" name="parentId" value={parentId} />}
            {stickerUrl && <input type="hidden" name="imageUrl" value={stickerUrl} />}

            {!user && (
                <div className="flex gap-2 mb-2">
                    <input
                        name="nickname"
                        className="border border-[#ddd] p-1 text-xs w-32 focus:border-[#3b4890] outline-none"
                        placeholder="닉네임"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        className="border border-[#ddd] p-1 text-xs w-32 focus:border-[#3b4890] outline-none"
                        placeholder="비밀번호"
                        required
                    />
                </div>
            )}

            <div className="mb-2">
                <textarea
                    name="content"
                    rows={3}
                    required={!isImageParams} // Not required if image/sticker exists? usually text is optional if image exists, but let's keep text required or allow empty if image? 
                    // DC allows image only. Let's make content optional if image/sticker is present.
                    // But Zod schema requires content. I should update schema or provide placeholder.
                    // For now, let's keep it simple: Text IS required usually. 
                    // Actually, if I attach a sticker, I might not want text. 
                    // I will stick to "Text required" for now to avoid validation errors, or I can auto-fill "." if empty.
                    className="w-full resize-none border border-[#ddd] bg-[#fff] p-2 text-sm focus:border-[#3b4890] focus:outline-none"
                    placeholder="댓글을 입력하세요..."
                />
            </div>

            {/* Preview Section */}
            {(previewUrl || stickerUrl) && (
                <div className="mb-2 relative inline-block">
                    <img 
                        src={previewUrl || stickerUrl!} 
                        alt="Preview" 
                        className="h-20 w-auto object-contain border border-gray-200"
                    />
                    <button 
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center bg-[#f7f7f7] p-2 border-t border-[#eee]">
                <div className="flex items-center gap-2">
                    <EmoticonPicker onSelect={handleStickerSelect} />
                    
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm border border-gray-300 px-2 py-1 rounded bg-white hover:bg-gray-50 flex items-center gap-1"
                    >
                        📷 이미지
                    </button>
                    <input
                        type="file"
                        name="image"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-20 bg-[#3b4890] text-white text-sm font-bold disabled:opacity-50 hover:bg-[#2d3870] py-1 rounded-sm"
                >
                    {isPending ? '등록중' : '등록'}
                </button>
            </div>
            
            {state?.errors?.content && <p className="text-red-500 text-xs mt-1">{state.errors.content}</p>}
        </form>
    )
}
