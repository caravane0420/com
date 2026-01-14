'use client'

import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function EmoticonPicker({ onSelect }: { onSelect: (url: string) => void }) {
    const { data: packs } = useSWR('/api/emoticons', fetcher)
    const [selectedPackId, setSelectedPackId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-sm border border-gray-300 px-2 py-1 rounded bg-white hover:bg-gray-50"
            >
                😀 디시콘
            </button>
        )
    }

    const activePack = selectedPackId ? packs?.find((p: any) => p.id === selectedPackId) : packs?.[0]

    return (
        <div className="relative z-10">
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm border border-gray-300 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 mb-2"
            >
                닫기
            </button>

            <div className="border border-gray-300 bg-white shadow-lg w-80 p-2 rounded">
                <div className="flex overflow-x-auto gap-2 mb-2 pb-2 border-b border-gray-100 scrollbar-hide">
                    {packs?.map((pack: any) => (
                        <button
                            key={pack.id}
                            type="button"
                            onClick={() => setSelectedPackId(pack.id)}
                            className={`px-2 py-1 text-xs whitespace-nowrap rounded ${activePack?.id === pack.id ? 'bg-[#3b4890] text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            {pack.name}
                        </button>
                    ))}
                    {packs?.length === 0 && <span className="text-xs text-gray-400">등록된 디시콘이 없습니다.</span>}
                </div>

                <div className="grid grid-cols-4 gap-2 h-48 overflow-y-auto">
                    {activePack?.emoticons.map((emo: any) => (
                        <button
                            key={emo.id}
                            type="button"
                            onClick={() => {
                                onSelect(emo.imageUrl)
                                setIsOpen(false)
                            }}
                            className="hover:bg-gray-100 p-1 rounded"
                        >
                            <img src={emo.imageUrl} alt="sticker" className="w-full h-auto object-contain" />
                        </button>
                    ))}
                    {activePack?.emoticons.length === 0 && (
                        <div className="col-span-4 text-center text-xs text-gray-400 py-4">이미지 없음</div>
                    )}
                </div>
            </div>
        </div>
    )
}
