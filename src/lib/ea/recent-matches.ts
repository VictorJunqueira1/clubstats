import type {
    HighlightKey,
    HighlightResponse,
    HighlightWinnerResponse,
    MatchClubResponse,
    MatchResponse,
    RecentClubStatsResponse,
    RecentMatchResult,
    RecentMatchSummaryResponse,
    RecentPlayerMatchResponse,
    RecentPlayerStatsResponse,
    RecentStatsResponse,
} from "@/src/types/responses/ea"

const MIN_GAMES_FOR_RATING = 3
const MIN_GAMES_FOR_CONSISTENCY = 3
const MIN_SHOTS_FOR_EFFICIENCY = 3
const MIN_PASSES_FOR_ACCURACY = 10
const COMPARISON_EPSILON = 0.000_001

function toNumber(value: string | number | undefined): number {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

function toIsoDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)

    return Number.isNaN(date.getTime())
        ? new Date(0).toISOString()
        : date.toISOString()
}

function getResult(club: MatchClubResponse): RecentMatchResult {
    if (toNumber(club.wins) > 0) return "win"
    if (toNumber(club.ties) > 0) return "draw"
    if (toNumber(club.losses) > 0) return "loss"

    const goalsFor = toNumber(club.goals)
    const goalsAgainst = toNumber(club.goalsAgainst)

    if (goalsFor > goalsAgainst) return "win"
    if (goalsFor < goalsAgainst) return "loss"

    return "draw"
}

function standardDeviation(values: number[]): number {
    if (values.length === 0) return 0

    const average =
        values.reduce((sum, value) => sum + value, 0) / values.length

    const variance =
        values.reduce(
            (sum, value) => sum + (value - average) ** 2,
            0,
        ) / values.length

    return Math.sqrt(variance)
}

function findClub(
    match: MatchResponse,
    clubId: string,
): MatchClubResponse | null {
    return match.clubs[clubId] ?? null
}

function findOpponent(
    match: MatchResponse,
    clubId: string,
): [string, MatchClubResponse] | null {
    const opponent = Object.entries(match.clubs).find(
        ([currentClubId]) => currentClubId !== clubId,
    )

    return opponent ?? null
}

function createMatchSummary(
    match: MatchResponse,
    clubId: string,
): RecentMatchSummaryResponse | null {
    const club = findClub(match, clubId)
    const opponent = findOpponent(match, clubId)

    if (!club || !opponent) return null

    const [opponentClubId, opponentClub] = opponent

    const decidedByDnf = Object.values(match.clubs).some(
        (item) => item.winnerByDnf === "1",
    )

    return {
        matchId: match.matchId,
        playedAt: toIsoDate(match.timestamp),
        result: getResult(club),
        goalsFor: toNumber(club.goals),
        goalsAgainst: toNumber(club.goalsAgainst),
        opponentClubId,
        opponentName: opponentClub.details?.name || "Adversário",
        decidedByDnf,
        wonByDnf: club.winnerByDnf === "1",
    }
}

function buildClubStats(
    matches: MatchResponse[],
    clubId: string,
): RecentClubStatsResponse {
    const summaries = matches
        .map((match) => createMatchSummary(match, clubId))
        .filter(
            (match): match is RecentMatchSummaryResponse =>
                match !== null,
        )

    const wins = summaries.filter(
        (match) => match.result === "win",
    ).length

    const draws = summaries.filter(
        (match) => match.result === "draw",
    ).length

    const losses = summaries.filter(
        (match) => match.result === "loss",
    ).length

    const goalsFor = summaries.reduce(
        (sum, match) => sum + match.goalsFor,
        0,
    )

    const goalsAgainst = summaries.reduce(
        (sum, match) => sum + match.goalsAgainst,
        0,
    )

    const points = wins * 3 + draws
    const maximumPoints = summaries.length * 3

    return {
        gamesPlayed: summaries.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points,
        pointsPercentage:
            maximumPoints > 0
                ? (points / maximumPoints) * 100
                : 0,
        matches: summaries,
    }
}

type MutableRecentPlayer = Omit<
    RecentPlayerStatsResponse,
    | "averageRating"
    | "passAccuracy"
    | "shotEfficiency"
    | "ratingConsistency"
> & {
    ratings: number[]
}

function buildPlayerStats(
    matches: MatchResponse[],
    clubId: string,
): RecentPlayerStatsResponse[] {
    const players = new Map<string, MutableRecentPlayer>()

    for (const match of matches) {
        const club = findClub(match, clubId)
        const opponent = findOpponent(match, clubId)
        const matchPlayers = match.players[clubId]

        if (!club || !opponent || !matchPlayers) continue

        const [, opponentClub] = opponent
        const result = getResult(club)

        for (const [playerId, player] of Object.entries(matchPlayers)) {
            const secondsPlayed = toNumber(player.secondsPlayed)

            if (secondsPlayed <= 0) continue

            const goals = toNumber(player.goals)
            const assists = toNumber(player.assists)
            const rating = toNumber(player.rating)
            const shots = toNumber(player.shots)
            const passesMade = toNumber(player.passesmade)
            const passAttempts = toNumber(player.passattempts)
            const manOfTheMatch = toNumber(player.mom) > 0

            const playerMatch: RecentPlayerMatchResponse = {
                matchId: match.matchId,
                playedAt: toIsoDate(match.timestamp),
                opponentName:
                    opponentClub.details?.name || "Adversário",
                result,
                goalsFor: toNumber(club.goals),
                goalsAgainst: toNumber(club.goalsAgainst),
                goals,
                assists,
                goalContributions: goals + assists,
                rating,
                manOfTheMatch,
                shots,
                passesMade,
                passAttempts,
                position: player.pos || "unknown",
                secondsPlayed,
            }

            const current = players.get(playerId) ?? {
                playerId,
                playerName: player.playername || playerId,
                gamesPlayed: 0,
                goals: 0,
                assists: 0,
                goalContributions: 0,
                manOfTheMatch: 0,
                shots: 0,
                passesMade: 0,
                passAttempts: 0,
                matches: [],
                ratings: [],
            }

            current.playerName =
                player.playername || current.playerName

            current.gamesPlayed += 1
            current.goals += goals
            current.assists += assists
            current.goalContributions += goals + assists
            current.manOfTheMatch += manOfTheMatch ? 1 : 0
            current.shots += shots
            current.passesMade += passesMade
            current.passAttempts += passAttempts
            current.matches.push(playerMatch)
            current.ratings.push(rating)

            players.set(playerId, current)
        }
    }

    return Array.from(players.values())
        .map((player) => ({
            playerId: player.playerId,
            playerName: player.playerName,
            gamesPlayed: player.gamesPlayed,
            goals: player.goals,
            assists: player.assists,
            goalContributions: player.goalContributions,
            averageRating:
                player.ratings.length > 0
                    ? player.ratings.reduce(
                        (sum, rating) => sum + rating,
                        0,
                    ) / player.ratings.length
                    : 0,
            manOfTheMatch: player.manOfTheMatch,
            shots: player.shots,
            passesMade: player.passesMade,
            passAttempts: player.passAttempts,
            passAccuracy:
                player.passAttempts > 0
                    ? (player.passesMade / player.passAttempts) * 100
                    : 0,
            shotEfficiency:
                player.shots > 0
                    ? (player.goals / player.shots) * 100
                    : 0,
            ratingConsistency: standardDeviation(player.ratings),
            matches: player.matches.sort(
                (left, right) =>
                    right.playedAt.localeCompare(left.playedAt),
            ),
        }))
        .sort(
            (left, right) =>
                right.goalContributions -
                left.goalContributions ||
                right.averageRating - left.averageRating,
        )
}

type HighlightDefinition = {
    key: HighlightKey
    title: string
    description: string
    candidates: (
        players: RecentPlayerStatsResponse[],
    ) => RecentPlayerStatsResponse[]
    value: (player: RecentPlayerStatsResponse) => number
    better: "max" | "min"
    format: (value: number) => string
}

function buildHighlight(
    players: RecentPlayerStatsResponse[],
    definition: HighlightDefinition,
): HighlightResponse {
    const candidates = definition.candidates(players)

    if (candidates.length === 0) {
        return {
            key: definition.key,
            title: definition.title,
            description: definition.description,
            winners: [],
        }
    }

    const values = candidates.map(definition.value)

    const bestValue =
        definition.better === "max"
            ? Math.max(...values)
            : Math.min(...values)

    const winners: HighlightWinnerResponse[] = candidates
        .filter(
            (player) =>
                Math.abs(
                    definition.value(player) - bestValue,
                ) <= COMPARISON_EPSILON,
        )
        .map((player) => ({
            playerId: player.playerId,
            playerName: player.playerName,
            value: bestValue,
            displayValue: definition.format(bestValue),
        }))

    return {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        winners,
    }
}

function buildHighlights(
    players: RecentPlayerStatsResponse[],
): HighlightResponse[] {
    const all = (items: RecentPlayerStatsResponse[]) => items

    const definitions: HighlightDefinition[] = [
        {
            key: "topScorer",
            title: "Artilheiro",
            description:
                "Maior número de gols nas últimas partidas.",
            candidates: all,
            value: (player) => player.goals,
            better: "max",
            format: (value) =>
                `${value} ${value === 1 ? "gol" : "gols"}`,
        },
        {
            key: "topAssister",
            title: "Garçom",
            description:
                "Maior número de assistências nas últimas partidas.",
            candidates: all,
            value: (player) => player.assists,
            better: "max",
            format: (value) =>
                `${value} ${value === 1
                    ? "assistência"
                    : "assistências"
                }`,
        },
        {
            key: "bestAverageRating",
            title: "Melhor nota média",
            description:
                `Considera jogadores com pelo menos ` +
                `${MIN_GAMES_FOR_RATING} partidas.`,
            candidates: (items) =>
                items.filter(
                    (player) =>
                        player.gamesPlayed >=
                        MIN_GAMES_FOR_RATING,
                ),
            value: (player) => player.averageRating,
            better: "max",
            format: (value) =>
                value.toFixed(2).replace(".", ","),
        },
        {
            key: "mostGoalContributions",
            title: "Maior participação em gols",
            description: "Soma de gols e assistências.",
            candidates: all,
            value: (player) => player.goalContributions,
            better: "max",
            format: (value) => `${value} G+A`,
        },
        {
            key: "mostManOfTheMatch",
            title: "Mais craque da partida",
            description:
                "Maior número de premiações de melhor em campo.",
            candidates: all,
            value: (player) => player.manOfTheMatch,
            better: "max",
            format: (value) =>
                `${value} ${value === 1 ? "vez" : "vezes"}`,
        },
        {
            key: "bestShotEfficiency",
            title: "Mais eficiente nas finalizações",
            description:
                `Conversão de gols com pelo menos ` +
                `${MIN_SHOTS_FOR_EFFICIENCY} finalizações.`,
            candidates: (items) =>
                items.filter(
                    (player) =>
                        player.shots >=
                        MIN_SHOTS_FOR_EFFICIENCY,
                ),
            value: (player) => player.shotEfficiency,
            better: "max",
            format: (value) =>
                `${value.toFixed(1).replace(".", ",")}%`,
        },
        {
            key: "bestPassAccuracy",
            title: "Mais preciso nos passes",
            description:
                `Precisão com pelo menos ` +
                `${MIN_PASSES_FOR_ACCURACY} passes tentados.`,
            candidates: (items) =>
                items.filter(
                    (player) =>
                        player.passAttempts >=
                        MIN_PASSES_FOR_ACCURACY,
                ),
            value: (player) => player.passAccuracy,
            better: "max",
            format: (value) =>
                `${value.toFixed(1).replace(".", ",")}%`,
        },
        {
            key: "mostConsistent",
            title: "Mais consistente",
            description:
                `Menor variação das notas com pelo menos ` +
                `${MIN_GAMES_FOR_CONSISTENCY} partidas.`,
            candidates: (items) =>
                items.filter(
                    (player) =>
                        player.gamesPlayed >=
                        MIN_GAMES_FOR_CONSISTENCY,
                ),
            value: (player) => player.ratingConsistency,
            better: "min",
            format: (value) =>
                `Variação ${value
                    .toFixed(2)
                    .replace(".", ",")}`,
        },
    ]

    return definitions.map((definition) =>
        buildHighlight(players, definition),
    )
}

export function buildRecentStats(
    matches: MatchResponse[],
    clubId: string,
): RecentStatsResponse {
    const orderedMatches = [...matches]
        .sort(
            (left, right) =>
                right.timestamp - left.timestamp,
        )
        .slice(0, 10)

    const players = buildPlayerStats(orderedMatches, clubId)

    return {
        club: buildClubStats(orderedMatches, clubId),
        players,
        highlights: buildHighlights(players),
    }
}