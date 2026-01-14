'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession, verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

const SignupSchema = z.object({
    username: z.string().min(2).trim(),
    password: z.string().min(6).trim(),
})

const LoginSchema = z.object({
    username: z.string().min(2).trim(),
    password: z.string().min(6).trim(),
})

const PostSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    imageUrl: z.string().optional(),
})

const CommentSchema = z.object({
    content: z.string().min(1),
    postId: z.string(),
})

export async function signup(prevState: any, formData: FormData) {
    const result = SignupSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    const { username, password } = result.data

    const existingUser = await db.user.findUnique({ where: { username } })
    if (existingUser) {
        return { errors: { username: ['Username already taken'] } }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.user.create({
        data: { username, password: hashedPassword },
    })

    await createSession(user.id)
    redirect('/')
}

export async function login(prevState: any, formData: FormData) {
    const result = LoginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    const { username, password } = result.data
    const user = await db.user.findUnique({ where: { username } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return { errors: { username: ['Invalid credentials'] } }
    }

    await createSession(user.id)
    redirect('/')
}

export async function logout() {
    await deleteSession()
}

export async function createPost(prevState: any, formData: FormData) {
    const session = await verifySession()
    const result = PostSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    await db.post.create({
        data: {
            title: result.data.title,
            content: result.data.content,
            imageUrl: result.data.imageUrl,
            authorId: session.userId,
        },
    })

    revalidatePath('/')
    redirect('/')
}

export async function createComment(prevState: any, formData: FormData) {
    const session = await verifySession()
    const result = CommentSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    await db.comment.create({
        data: {
            content: result.data.content,
            postId: result.data.postId,
            authorId: session.userId, // Authenticated comments
        },
    })

    revalidatePath(`/posts/${result.data.postId}`)
    return { success: true }
}
