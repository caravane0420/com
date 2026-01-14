import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it')

const cookie = {
    name: 'session',
    options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' },
    duration: 24 * 60 * 60 * 1000,
}

export type SessionPayload = {
    userId: string
    username: string
    expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1day')
        .sign(key)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        })
        return payload as unknown as SessionPayload
    } catch (error) {
        return null
    }
}

export async function createSession(userId: string, username: string) {
    const expiresAt = new Date(Date.now() + cookie.duration)
    const session = await encrypt({ userId, username, expiresAt })

    const c = await cookies()
    c.set(cookie.name, session, { ...cookie.options, expires: expiresAt })
}

export async function verifySession() {
    const c = await cookies()
    const session = c.get(cookie.name)?.value
    const payload = await decrypt(session)

    if (!payload?.userId) {
        redirect('/login')
    }

    return { userId: payload.userId, username: payload.username }
}

export async function deleteSession() {
    const c = await cookies()
    c.delete(cookie.name)
    redirect('/login')
}

export async function getSession() {
    const c = await cookies()
    const session = c.get(cookie.name)?.value
    const payload = await decrypt(session)
    return payload
}
