import type { MemberResponse } from "@/src/types/responses/ea"

export function last10Goals(member: MemberResponse): number[] {
    return Array.from({ length: 10 }, (_, index) => Number(member[`prevGoals${index + 1}`] ?? "0"))
}

export function gaTotal(member: MemberResponse): number {
    return Number(member.goals ?? "0") + Number(member.assists ?? "0")
}

export function gaPerGame(member: MemberResponse): number {
    const games = Number(member.gamesPlayed ?? "0")
    return games > 0 ? gaTotal(member) / games : 0
}