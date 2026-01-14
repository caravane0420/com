'use client'

import { useActionState, useState } from 'react'
import { createReport } from '@/app/actions'

interface ReportButtonProps {
    targetType: 'POST' | 'COMMENT'
    targetId: string
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [state, action, isPending] = useActionState(createReport, null)

    if (state?.success && isOpen) {
        alert(state.message) // Simple feedback
        setIsOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-gray-500 hover:text-red-600 hover:underline"
            >
                신고
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form action={action} className="bg-white p-6 rounded shadow-lg w-80">
                        <h3 className="font-bold mb-4 text-[#333]">신고하기</h3>
                        <input type="hidden" name="targetType" value={targetType} />
                        <input type="hidden" name="targetId" value={targetId} />

                        <div className="mb-4">
                            <label className="block text-xs font-bold mb-1">사유</label>
                            <select name="reason" className="w-full border p-2 rounded text-sm">
                                <option value="SPAM">스팸 / 홍보</option>
                                <option value="ABUSE">욕설 / 비하</option>
                                <option value="ADULT">음란물</option>
                                <option value="ILLEGAL">불법 정보</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold mb-1">상세 내용 (선택)</label>
                            <textarea name="details" className="w-full border p-2 rounded text-sm resize-none" rows={3}></textarea>
                        </div>

                        {state?.errors?.reason && <p className="text-red-500 text-xs mb-2">{state.errors.reason}</p>}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                disabled={isPending}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {isPending ? '처리중' : '신고'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}
