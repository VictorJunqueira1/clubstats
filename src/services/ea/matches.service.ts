import type { MatchResponse } from "@/src/types/responses/ea"
import { fetchEa } from "./ea.client"
import { MATCHES_LIMIT, MATCHES_URL } from "./ea.config"
import { isRecord } from "./ea.guard"

function isMatchResponse(value: unknown): value is MatchResponse {
    if (!isRecord(value)) return false

    return (
        typeof value.matchId === "string" &&
        typeof value.timestamp === "number" &&
        isRecord(value.clubs) &&
        isRecord(value.players)
    )
}

export async function getMatches(): Promise<MatchResponse[]> {
    const response = await fetchEa<unknown>(
        MATCHES_URL,
        "as últimas partidas do clube",
    )

    if (!Array.isArray(response)) {
        throw new Error(
            "A API da EA retornou uma resposta inválida para as últimas partidas.",
        )
    }

    return response
        .filter(isMatchResponse)
        .sort((left, right) => right.timestamp - left.timestamp)
        .slice(0, MATCHES_LIMIT)
}