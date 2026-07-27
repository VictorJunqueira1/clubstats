import { fetchEa } from "./ea.client"
import { CLUB_ID, CLUB_NAME, CLUB_URL } from "./ea.config"
import type { ClubStatsResponse } from "@/src/types/responses/ea"

export async function getClub(): Promise<ClubStatsResponse> {
    const response = await fetchEa<unknown>(CLUB_URL, "as estatísticas do clube")

    if (!Array.isArray(response)) {
        throw new Error("A API da EA retornou uma resposta inválida para as estatísticas do clube.")
    }

    const clubs = response as ClubStatsResponse[]
    const club = clubs.find((item) => item.clubId === CLUB_ID) ?? clubs[0]

    if (!club) {
        throw new Error(`O clube ${CLUB_NAME} não foi encontrado na API da EA.`)
    }

    return club
}