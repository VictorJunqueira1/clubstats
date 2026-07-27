import type { ClubStatsResponse } from "./club.response"
import type { MemberResponse } from "./member.response"
import type { PositionCountResponse } from "./members.response"

export type StatsResponse = {
    club: ClubStatsResponse
    members: MemberResponse[]
    positionCount: PositionCountResponse
    fetchedAt: string
}