import type { CustomKitResponse } from "./club.response"

export type MatchTimeAgoResponse = {
    number: number
    unit: string
}

export type MatchClubDetailsResponse = {
    name: string
    clubId: number
    regionId: number
    teamId: number
    customKit: CustomKitResponse
}

export type MatchClubResponse = {
    date: string
    gameNumber: string
    goals: string
    goalsAgainst: string
    losses: string
    matchType: string
    result: string
    score: string
    season_id: string
    TEAM: string
    ties: string
    winnerByDnf: string
    wins: string
    details: MatchClubDetailsResponse
}

export type MatchPlayerResponse = {
    archetypeid: string
    assists: string
    ballDiveSaves: string
    cleansheetsany: string
    cleansheetsdef: string
    cleansheetsgk: string
    crossSaves: string
    gameTime: string
    goals: string
    goalsconceded: string
    goodDirectionSaves: string
    losses: string
    match_event_aggregate_0: string
    match_event_aggregate_1: string
    match_event_aggregate_2: string
    match_event_aggregate_3: string
    mom: string
    namespace: string
    parrySaves: string
    passattempts: string
    passesmade: string
    pos: string
    punchSaves: string
    rating: string
    realtimegame: string
    realtimeidle: string
    redcards: string
    reflexSaves: string
    saves: string
    SCORE: string
    secondsPlayed: string
    shots: string
    tackleattempts: string
    tacklesmade: string
    userResult: string
    vproattr: string
    vprohackreason: string
    wins: string
    playername: string
    [key: string]: string
}

export type MatchAggregateResponse = Record<string, string | number>

export type MatchResponse = {
    matchId: string
    timestamp: number
    timeAgo: MatchTimeAgoResponse
    clubs: Record<string, MatchClubResponse>
    players: Record<string, Record<string, MatchPlayerResponse>>
    aggregate: Record<string, MatchAggregateResponse>
}