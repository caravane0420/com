
import { db } from "@/lib/db"

export async function checkRestrictions(ip: string, userId?: string, content?: string) {
    // 1. Check IP Ban
    const ipBan = await db.ban.findFirst({
        where: { type: 'IP', value: ip }
    })
    if (ipBan) return { restricted: true, reason: `IP blocked: ${ipBan.reason || 'No reason'}` }

    // 2. Check User Ban
    if (userId) {
        const userBan = await db.ban.findFirst({
            where: { type: 'USER', value: userId }
        })
        if (userBan) return { restricted: true, reason: `User blocked: ${userBan.reason || 'No reason'}` }
    }

    // 3. Check Forbidden Words
    if (content) {
        const forbiddenWords = await db.forbiddenWord.findMany()
        for (const fw of forbiddenWords) {
            if (content.includes(fw.word)) {
                return { restricted: true, reason: `Forbidden word detected: ${fw.word}` }
            }
        }
    }

    return { restricted: false }
}
