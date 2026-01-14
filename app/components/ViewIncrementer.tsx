'use client'

import { useEffect, useRef } from 'react'
import { incrementView } from '@/app/actions'

export default function ViewIncrementer({ postId }: { postId: string }) {
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            incrementView(postId)
        }
    }, [postId])

    return null
}
