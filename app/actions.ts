'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession, verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { VoteType } from '@prisma/client'

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
})

const CommentSchema = z.object({
    content: z.string().min(1, "내용을 입력해주세요."),
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
    const session = await verifySession()

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
    }

    const result = PostSchema.safeParse(rawData)

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors }
    }

    let gallery = await db.gallery.findUnique({ where: { id: 'main' } })
    if (!gallery) {
        gallery = await db.gallery.create({
            data: { id: 'main', name: '자유 갤러리' }
        })
    }

    await db.post.create({
        data: {
            title: result.data.title,
            content: result.data.content,
            imageUrl: result.data.imageUrl,
            authorId: session.userId,
            galleryId: gallery.id,
        },
    })

    revalidatePath('/')
    redirect('/')
}

export async function deletePost(postId: string) {
    const session = await verifySession()
    const user = await db.user.findUnique({ where: { id: session.userId } })

    const post = await db.post.findUnique({ where: { id: postId } })

    if (!post) return;

    if (user?.role === 'ADMIN' || post.authorId === session.userId) {
        await db.post.delete({ where: { id: postId } })
        revalidatePath('/')
        redirect('/')
    }
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
            authorId: session.userId,
        },
    })

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
            data: { userId: session.userId, postId, type: VoteType.UP }
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
            data: { userId: session.userId, postId, type: VoteType.DOWN }
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
