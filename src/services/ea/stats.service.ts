import { getClub } from "./club.service"
import { getMembers } from "./members.service"
import type { StatsResponse } from "@/src/types/responses/ea"

export async function getStats(): Promise<StatsResponse> {
    const [club, membersResponse] = await Promise.all([getClub(), getMembers()])

    return {
        club,
        members: membersResponse.members,
        positionCount: membersResponse.positionCount,
        fetchedAt: new Date().toISOString(),
    }
}