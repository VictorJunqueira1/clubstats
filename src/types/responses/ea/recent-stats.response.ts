export type RecentMatchResult = "win" | "draw" | "loss"

export type RecentMatchSummaryResponse = {
    matchId: string
    playedAt: string
    result: RecentMatchResult
    goalsFor: number
    goalsAgainst: number
    opponentClubId: string
    opponentName: string
    decidedByDnf: boolean
    wonByDnf: boolean
}

export type RecentClubStatsResponse = {
    gamesPlayed: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
    pointsPercentage: number
    matches: RecentMatchSummaryResponse[]
}

export type RecentPlayerMatchResponse = {
    matchId: string
    playedAt: string
    opponentName: string
    result: RecentMatchResult
    goalsFor: number
    goalsAgainst: number
    goals: number
    assists: number
    goalContributions: number
    rating: number
    manOfTheMatch: boolean
    shots: number
    passesMade: number
    passAttempts: number
    position: string
    secondsPlayed: number
}

export type RecentPlayerStatsResponse = {
    playerId: string
    playerName: string
    gamesPlayed: number
    goals: number
    assists: number
    goalContributions: number
    averageRating: number
    manOfTheMatch: number
    shots: number
    passesMade: number
    passAttempts: number
    passAccuracy: number
    shotEfficiency: number
    minutesPlayed: number
    goalContributionsPer90: number
    ratingConsistency: number
    matches: RecentPlayerMatchResponse[]
}

export type HighlightKey =
    | "topScorer"
    | "topAssister"
    | "bestAverageRating"
    | "mostGoalContributions"
    | "mostManOfTheMatch"
    | "bestShotEfficiency"
    | "bestPassAccuracy"
    | "mostConsistent"

export type HighlightWinnerResponse = {
    playerId: string
    playerName: string
    value: number
    displayValue: string
}

export type HighlightResponse = {
    key: HighlightKey
    title: string
    description: string
    winners: HighlightWinnerResponse[]
}

export type RecentStatsResponse = {
    club: RecentClubStatsResponse
    players: RecentPlayerStatsResponse[]
    highlights: HighlightResponse[]
}