'use server'

import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Middleware-like check for Admin Actions
async function checkAdmin() {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")

    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (!user || user.role !== 'ADMIN') throw new Error("Forbidden")
    return user
}

// --- Forbidden Words ---
const WordSchema = z.object({ word: z.string().min(1) })

export async function addForbiddenWord(prevState: any, formData: FormData) {
    await checkAdmin()
    const word = formData.get('word') as string

    if (!word) return { error: "Word is required" }

    try {
        await db.forbiddenWord.create({ data: { word } })
        revalidatePath('/admin/words')
        return { success: true }
    } catch (e) {
        return { error: "Word already exists or error" }
    }
}

export async function deleteForbiddenWord(id: string) {
    await checkAdmin()
    await db.forbiddenWord.delete({ where: { id } })
    revalidatePath('/admin/words')
}

// --- Bans ---
const BanSchema = z.object({
    type: z.enum(['IP', 'USER']),
    value: z.string().min(1),
    reason: z.string().optional(),
})

export async function addBan(prevState: any, formData: FormData) {
    await checkAdmin()

    const rawData = {
        type: formData.get('type'),
        value: formData.get('value'),
        reason: formData.get('reason'),
    }

    const result = BanSchema.safeParse(rawData)
    if (!result.success) return { error: "Invalid data" }

    try {
        await db.ban.create({
            data: {
                type: result.data.type as 'IP' | 'USER',
                value: result.data.value,
                reason: result.data.reason,
            }
        })
        revalidatePath('/admin/bans')
        return { success: true }
    } catch (e) {
        return { error: "Error creating ban" }
    }
}

export async function deleteBan(id: string) {
    await checkAdmin()
    await db.ban.delete({ where: { id } })
    revalidatePath('/admin/bans')
}

// --- Reports ---
export async function resolveReport(reportId: string, action: 'RESOLVE' | 'DISMISS' | 'DELETE_CONTENT') {
    await checkAdmin()

    const report = await db.report.findUnique({ where: { id: reportId } })
    if (!report) return { error: "Report not found" }

    if (action === 'DELETE_CONTENT') {
        if (report.targetType === 'POST') {
            await db.post.delete({ where: { id: report.targetId } }).catch(() => { })
        } else if (report.targetType === 'COMMENT') {
            await db.comment.delete({ where: { id: report.targetId } }).catch(() => { })
        }
    }

    await db.report.update({
        where: { id: reportId },
        data: { status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED' } // If Deleted, also Marked Resolved
    })

    if (action === 'DELETE_CONTENT') {
        // Maybe mark as resolved too?
        await db.report.update({ where: { id: reportId }, data: { status: 'RESOLVED' } })
    }

    revalidatePath('/admin/reports')
}
