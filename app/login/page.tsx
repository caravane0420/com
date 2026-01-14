'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'
import Link from 'next/link'

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, null)

    return (
        <div className="flex justify-center items-center py-20 bg-[#f4f4f4]">
            <div className="w-full max-w-[400px] bg-white border border-[#ccc] p-8 shadow-sm">
                <div className="flex justify-between items-end mb-6 border-b-2 border-[#3b4890] pb-2">
                    <h2 className="text-[#3b4890] font-bold text-xl">멤버 로그인</h2>
                </div>

                <form action={action} className="space-y-4">
                    <div>
                        <input
                            name="username"
                            placeholder="아이디"
                            required
                            className="w-full h-10 px-3 border border-[#ddd] focus:border-[#3b4890] outline-none"
                        />
                        {state?.errors?.username && <p className="text-red-500 text-xs mt-1">{state.errors.username}</p>}
                    </div>
                    <div>
                        <input
                            name="password"
                            type="password"
                            placeholder="비밀번호"
                            required
                            className="w-full h-10 px-3 border border-[#ddd] focus:border-[#3b4890] outline-none"
                        />
                    </div>

                    <button
                        disabled={isPending}
                        className="w-full bg-[#3b4890] text-white h-12 font-bold text-lg mt-2 hover:bg-[#2d3870] disabled:opacity-70"
                    >
                        {isPending ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-4 text-center text-xs text-gray-500 flex justify-center gap-4">
                    <Link href="/register" className="hover:underline">회원가입</Link>
                    <span>|</span>
                    <Link href="#" className="hover:underline">아이디/비밀번호 찾기</Link>
                </div>
            </div>
        </div>
    )
}
