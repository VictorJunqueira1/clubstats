import type { ClubStatsResponse } from "./club.response"
import type { MemberResponse } from "./member.response"
import type { PositionCountResponse } from "./members.response"
import type { RecentStatsResponse } from "./recent-stats.response"

export type StatsResponse = {
    club: ClubStatsResponse
    members: MemberResponse[]
    positionCount: PositionCountResponse
    recent: RecentStatsResponse
    fetchedAt: string
}