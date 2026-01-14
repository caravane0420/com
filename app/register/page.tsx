'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions'
import Link from 'next/link'

export default function RegisterPage() {
    const [state, action, isPending] = useActionState(signup, null)

    return (
        <div className="flex justify-center items-center py-20 bg-[#f4f4f4]">
            <div className="w-full max-w-[400px] bg-white border border-[#ccc] p-8 shadow-sm">
                <div className="flex justify-between items-end mb-6 border-b-2 border-[#3b4890] pb-2">
                    <h2 className="text-[#3b4890] font-bold text-xl">회원가입</h2>
                </div>

                <form action={action} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">아이디</label>
                        <input
                            name="username"
                            required
                            className="w-full h-9 px-3 border border-[#ddd] focus:border-[#3b4890] outline-none"
                        />
                        {state?.errors?.username && <p className="text-red-500 text-xs mt-1">{state.errors.username}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">비밀번호</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full h-9 px-3 border border-[#ddd] focus:border-[#3b4890] outline-none"
                        />
                        {state?.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password}</p>}
                    </div>

                    <button
                        disabled={isPending}
                        className="w-full bg-[#3b4890] text-white h-10 font-bold mt-4 hover:bg-[#2d3870] disabled:opacity-70"
                    >
                        {isPending ? '가입 중...' : '가입하기'}
                    </button>
                </form>
                <div className="mt-4 text-center text-xs text-gray-500">
                    이미 계정이 있으신가요? <Link href="/login" className="text-[#3b4890] underline">로그인</Link>
                </div>
            </div>
        </div>
    )
}
