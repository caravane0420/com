'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession, verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'

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

    // Check if file is valid (size > 0 and name exists)
    if (file && file.size > 0 && file.name) {
        try {
            const blob = await put(file.name, file, {
                access: 'public',
            });
            uploadedImageUrl = blob.url;
        } catch (error) {
            console.error('Image upload failed:', error);
            // Validating env: if BLOB token missing, this fails. 
            // We continue without image or return error?
            // For now, continue but log.
            // Or fallback to URL input provided?
        }
    }

    // Fallback to URL input if no file upload or upload failed (but prioritize upload)
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

    // Allow Admin OR Author
    if (user?.role === 'ADMIN' || post.authorId === session.userId) {
        await db.post.delete({ where: { id: postId } })
        revalidatePath('/')
        redirect('/') // Redirect to list
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
    await db.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
    })
    revalidatePath('/')
    revalidatePath(`/posts/${postId}`)
}

export async function recommendPost(postId: string) {
    await db.post.update({
        where: { id: postId },
        data: { upCount: { increment: 1 } },
    })
    revalidatePath('/')
    revalidatePath(`/posts/${postId}`)
}

export async function downvotePost(postId: string) {
    await db.post.update({
        where: { id: postId },
        data: { downCount: { increment: 1 } },
    })
    revalidatePath('/')
    revalidatePath(`/posts/${postId}`)
}
