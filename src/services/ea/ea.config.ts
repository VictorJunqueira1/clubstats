import { GetClubRequest } from "@/src/types/requests/ea/get-club.request"
import { GetMembersRequest } from "@/src/types/requests/ea/get-members.request"

const EA_BASE_URL = "https://proclubs.ea.com/api/fc"

export const CLUB_ID = "8782476"
export const PLATFORM = "common-gen5"
export const CLUB_NAME = "preto shifu"

export const DEFAULT_MEMBERS_REQUEST: GetMembersRequest = {
    platform: PLATFORM,
    clubId: CLUB_ID,
}

export const DEFAULT_CLUB_REQUEST: GetClubRequest = {
    platform: PLATFORM,
    clubName: CLUB_NAME,
}

export function buildMembersUrl(request: GetMembersRequest): string {
    const params = new URLSearchParams({
        platform: request.platform,
        clubId: request.clubId,
    })

    return `${EA_BASE_URL}/members/stats?${params.toString()}`
}

export function buildClubUrl(request: GetClubRequest): string {
    const params = new URLSearchParams({
        platform: request.platform,
        clubName: request.clubName,
    })

    return `${EA_BASE_URL}/allTimeLeaderboard/search?${params.toString()}`
}

export const MEMBERS_URL = buildMembersUrl(DEFAULT_MEMBERS_REQUEST)
export const CLUB_URL = buildClubUrl(DEFAULT_CLUB_REQUEST)