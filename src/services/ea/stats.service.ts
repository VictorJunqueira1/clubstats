import { buildRecentStats } from "@/src/lib/ea/recent-matches"
import type { StatsResponse } from "@/src/types/responses/ea"
import { getClub } from "./club.service"
import { CLUB_ID } from "./ea.config"
import { getMatches } from "./matches.service"
import { getMembers } from "./members.service"

export async function getStats(): Promise<StatsResponse> {
    const [club, membersResponse, matches] = await Promise.all([
        getClub(),
        getMembers(),
        getMatches(),
    ])

    return {
        club,
        members: membersResponse.members,
        positionCount: membersResponse.positionCount,
        recent: buildRecentStats(matches, CLUB_ID),
        fetchedAt: new Date().toISOString(),
    }
}