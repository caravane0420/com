import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it')

const cookie = {
    name: 'session',
    options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' },
    duration: 24 * 60 * 60 * 1000,
}

export async function encrypt(payload: any) {
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
        return payload
    } catch (error) {
        return null
    }
}

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + cookie.duration)
    const session = await encrypt({ userId, expires })

    const c = await cookies()
    c.set(cookie.name, session, { ...cookie.options, expires })
}

export async function verifySession() {
    const c = await cookies()
    const session = c.get(cookie.name)?.value
    const payload = await decrypt(session)

    if (!payload?.userId) {
        redirect('/login')
    }

    return { userId: payload.userId as string }
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
