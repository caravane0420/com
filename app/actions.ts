'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession, verifySession, getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { headers } from 'next/headers'
import { checkRestrictions } from '@/lib/restrictions'

const GuestSchema = z.object({
    nickname: z.string().min(2, "닉네임은 2글자 이상이어야 합니다."),
    password: z.string().min(4, "비밀번호는 4글자 이상이어야 합니다.")
})

const SignupSchema = z.object({
    username: z.string().min(2, "아이디는 2글자 이상이어야 합니다.").trim(),
    password: z.string().min(6, "비밀번호는 6글자 이상이어야 합니다.").trim(),
})

const LoginSchema = z.object({
    username: z.string().min(1, "아이디를 입력해주세요.").trim(),
    password: z.string().min(1, "비밀번호를 입력해주세요.").trim(),
})

const PostSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요."),
    content: z.string().min(1, "내용을 입력해주세요."),
    imageUrl: z.string().optional(),
    nickname: z.string().optional(),
    password: z.string().optional(),
})

const CommentSchema = z.object({
    content: z.string().min(1, "내용을 입력해주세요."),
    postId: z.string(),
    nickname: z.string().optional(),
    password: z.string().optional(),
    parentId: z.string().optional(), // For replies
})

// Report Schema
const ReportSchema = z.object({
    reason: z.string().min(1, "신고 사유를 입력해주세요."),
    details: z.string().optional(),
    targetType: z.enum(['POST', 'COMMENT']),
    targetId: z.string(),
})

export async function createReport(prevState: any, formData: FormData) {
    const session = await getSession()
    const result = ReportSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    await db.report.create({
        data: {
            reason: result.data.reason,
            details: result.data.details,
            targetType: result.data.targetType,
            targetId: result.data.targetId,
            reporterId: session?.userId,
        }
    })

    return { success: true, message: '신고가 접수되었습니다.' }
}

export async function signup(prevState: any, formData: FormData) {
    const result = SignupSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    const { username, password } = result.data

    const existingUser = await db.user.findUnique({ where: { username } })
    if (existingUser) {
        return { errors: { username: ['이미 사용 중인 아이디입니다.'] } }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.user.create({
        data: { username, password: hashedPassword },
    })

    await createSession(user.id, user.username)
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
        return { errors: { username: ['아이디 또는 비밀번호가 잘못되었습니다.'] } }
    }

    await createSession(user.id, user.username)
    redirect('/')
}

export async function logout() {
    await deleteSession()
}

export async function createPost(prevState: any, formData: FormData) {
    const session = await getSession() // Use getSession to allow null (Verification not strict)

    // IP Handling
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1'
    const maskedIp = ip.split('.').slice(0, 2).join('.') // "123.45"

    // [New] Check Restrictions
    const restriction = await checkRestrictions(ip, session?.userId, formData.get('content') as string)
    if (restriction.restricted) {
        return { errors: { content: [restriction.reason!] } } // Return error to form
    }

    // Manual File Handling
    const file = formData.get('image') as File;
    let uploadedImageUrl = '';

    if (file && file.size > 0 && file.name) {
        try {
            const blob = await put(file.name, file, { access: 'public' });
            uploadedImageUrl = blob.url;
        } catch (error) {
            console.error('Image upload failed:', error);
        }
    }

    const urlInput = formData.get('imageUrl') as string;
    const finalImageUrl = uploadedImageUrl || urlInput;

    const rawData = {
        title: formData.get('title'),
        content: formData.get('content'),
        imageUrl: finalImageUrl,
        nickname: formData.get('nickname'),
        password: formData.get('password'),
    }

    const result = PostSchema.safeParse(rawData)

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    // Guest Validation
    if (!session) {
        if (!result.data.nickname || !result.data.password) {
            return { errors: { nickname: ['닉네임과 비밀번호가 필요합니다.'] } }
        }
    }

    // Gallery Logic
    let gallery = await db.gallery.findUnique({ where: { id: 'main' } })
    if (!gallery) {
        gallery = await db.gallery.create({
            data: { id: 'main', name: '자유 갤러리' }
        })
    }

    const postData: any = {
        title: result.data.title,
        content: result.data.content,
        imageUrl: result.data.imageUrl,
        galleryId: gallery.id,
        ipAddress: maskedIp,
    }

    if (session) {
        postData.authorId = session.userId
    } else {
        postData.nickname = result.data.nickname
        postData.password = result.data.password // Should hash in real app, simplistic for now or hash?
        // Let's hash guest password for consistency if we want
        // postData.password = await bcrypt.hash(result.data.password!, 10)
    }

    // Hash password if guest
    if (!session && result.data.password) {
        postData.password = await bcrypt.hash(result.data.password, 10)
    }

    await db.post.create({
        data: postData,
    })

    // Experience
    if (session) {
        await db.user.update({ where: { id: session.userId }, data: { exp: { increment: 10 } } })
    }

    revalidatePath('/')
    redirect('/')
}

// Updated deletePost to handle guest password verification
export async function deletePost(postId: string, password?: string) {
    const session = await getSession()
    const user = session ? await db.user.findUnique({ where: { id: session.userId } }) : null

    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) return { success: false, message: 'Post not found' }

    let authorized = false

    if (session) {
        if (user?.role === 'ADMIN' || post.authorId === session.userId) {
            authorized = true
        }
    }

    // Guest check
    if (!authorized && !post.authorId && post.password && password) {
        const match = await bcrypt.compare(password, post.password)
        if (match) authorized = true
    }

    if (authorized) {
        await db.post.delete({ where: { id: postId } })
        revalidatePath('/')
        return { success: true }
    }

    return { success: false, message: '권한이 없거나 비밀번호가 틀렸습니다.' }
}

export async function createComment(prevState: any, formData: FormData) {
    const session = await getSession()

    // IP Logic
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1'
    const maskedIp = ip.split('.').slice(0, 2).join('.')

    // [New] Check Restrictions
    const restriction = await checkRestrictions(ip, session?.userId, formData.get('content') as string)
    if (restriction.restricted) {
        return { errors: { content: [restriction.reason!] } }
    }

    const result = CommentSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    const commentData: any = {
        content: result.data.content,
        postId: result.data.postId,
        ipAddress: maskedIp,
    }

    if (result.data.parentId) {
        commentData.parentId = result.data.parentId
    }

    if (session) {
        commentData.authorId = session.userId
    } else {
        if (!result.data.nickname || !result.data.password) {
            return { errors: { nickname: ['닉네임/비번 필요'] } }
        }
        commentData.nickname = result.data.nickname
        commentData.password = await bcrypt.hash(result.data.password, 10)
    }

    await db.comment.create({ data: commentData })

    if (session) {
        await db.user.update({ where: { id: session.userId }, data: { exp: { increment: 2 } } })
    }

    revalidatePath(`/posts/${result.data.postId}`)
    return { success: true }
}

export async function incrementView(postId: string) {
    // View count logic remains simple (no detailed duplicate check user side here to avoid complexity on every load, 
    // but typically handled via cookie/IP on middleware or dedicated route. 
    // Leaving as-is for simplicity unless strict requirement.)
    await db.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
    })
    revalidatePath('/')
    revalidatePath(`/posts/${postId}`)
}

export async function recommendPost(postId: string) {
    const session = await verifySession()

    const existing = await db.vote.findUnique({
        where: { userId_postId: { userId: session.userId, postId } }
    })

    if (existing) {
        return { success: false, message: '이미 참여했습니다.' }
    }

    await db.$transaction([
        db.vote.create({
            data: { userId: session.userId, postId, type: 'UP' }
        }),
        db.post.update({
            where: { id: postId },
            data: { upCount: { increment: 1 } },
        })
    ])

    revalidatePath('/')
    revalidatePath(`/posts/${postId}`)
    return { success: true, message: '추천하였습니다.' }
}

export async function downvotePost(postId: string) {
    const session = await verifySession()

    const existing = await db.vote.findUnique({
        where: { userId_postId: { userId: session.userId, postId } }
    })

    if (existing) {
        return { success: false, message: '이미 참여했습니다.' }
    }

    await db.$transaction([
        db.vote.create({
            data: { userId: session.userId, postId, type: 'DOWN' }
        }),
        db.post.update({
            where: { id: postId },
            data: { downCount: { increment: 1 } },
        })
    ])

    revalidatePath('/')
    revalidatePath(`/posts/${postId}`)
    return { success: true, message: '비추천하였습니다.' }
}

// Emoticon Admin Actions
export async function createEmoticonPack(prevState: any, formData: FormData) {
    const session = await verifySession()
    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (user?.role !== 'ADMIN') return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    if (!name) return { error: 'Name required' }

    const pack = await db.emoticonPack.create({ data: { name } })
    revalidatePath('/admin/emoticons')
    return { success: true, packId: pack.id }
}

export async function addEmoticon(packId: string, prevState: any, formData: FormData) {
    const session = await verifySession()
    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (user?.role !== 'ADMIN') return { error: 'Unauthorized' }

    const file = formData.get('image') as File
    if (!file) return { error: 'File required' }

    try {
        const blob = await put(file.name, file, { access: 'public' })
        await db.emoticon.create({
            data: {
                imageUrl: blob.url,
                packId,
                code: `~img:${blob.url}~` // Simple code logic
            }
        })
        revalidatePath('/admin/emoticons')
        return { success: true }
    } catch (e) {
        return { error: 'Upload failed' }
    }
}
