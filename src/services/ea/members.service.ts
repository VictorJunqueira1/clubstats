import { fetchEa } from "./ea.client"
import { MEMBERS_URL } from "./ea.config"
import { isRecord } from "./ea.guard"
import type { MembersResponse } from "@/src/types/responses/ea"

export async function getMembers(): Promise<MembersResponse> {
    const response = await fetchEa<unknown>(MEMBERS_URL, "as estatísticas dos jogadores")

    if (!isRecord(response) || !Array.isArray(response.members) || !isRecord(response.positionCount)) {
        throw new Error("A API da EA retornou uma resposta inválida para as estatísticas dos jogadores.")
    }

    return response as MembersResponse
}