import type { GetClubRequest } from "@/src/types/requests/ea/get-club.request"
import type { GetMatchesRequest } from "@/src/types/requests/ea/get-matches.request"
import type { GetMembersRequest } from "@/src/types/requests/ea/get-members.request"

const EA_BASE_URL = "https://proclubs.ea.com/api/fc"

export const CLUB_ID = "8782476"
export const PLATFORM = "common-gen5"
export const CLUB_NAME = "preto shifu"
export const MATCH_TYPE = "leagueMatch"
export const MATCHES_LIMIT = 10

export const DEFAULT_MEMBERS_REQUEST: GetMembersRequest = {
    platform: PLATFORM,
    clubId: CLUB_ID,
}

export const DEFAULT_CLUB_REQUEST: GetClubRequest = {
    platform: PLATFORM,
    clubName: CLUB_NAME,
}

export const DEFAULT_MATCHES_REQUEST: GetMatchesRequest = {
    platform: PLATFORM,
    clubId: CLUB_ID,
    matchType: MATCH_TYPE,
    maxResultCount: MATCHES_LIMIT,
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

export function buildMatchesUrl(request: GetMatchesRequest): string {
    const params = new URLSearchParams({
        platform: request.platform,
        clubIds: request.clubId,
        matchType: request.matchType,
        maxResultCount: String(request.maxResultCount),
    })

    return `${EA_BASE_URL}/clubs/matches?${params.toString()}`
}

export const MEMBERS_URL = buildMembersUrl(DEFAULT_MEMBERS_REQUEST)
export const CLUB_URL = buildClubUrl(DEFAULT_CLUB_REQUEST)
export const MATCHES_URL = buildMatchesUrl(DEFAULT_MATCHES_REQUEST)