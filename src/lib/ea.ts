// Camada de integração com a API oficial do EA FC Pro Clubs.

export const CLUB_ID = "8782476"
export const PLATFORM = "common-gen5"
export const CLUB_NAME = "preto shifu"

export const MEMBERS_URL = `https://proclubs.ea.com/api/fc/members/stats?platform=${PLATFORM}&clubId=${CLUB_ID}`
export const CLUB_URL = `https://proclubs.ea.com/api/fc/allTimeLeaderboard/search?platform=${PLATFORM}&clubName=${encodeURIComponent(CLUB_NAME)}`

export type Member = {
  name: string
  gamesPlayed: string
  winRate: string
  goals: string
  assists: string
  cleanSheetsDef: string
  cleanSheetsGK: string
  shotSuccessRate: string
  passesMade: string
  passSuccessRate: string
  ratingAve: string
  tacklesMade: string
  tackleSuccessRate: string
  proName: string
  proPos: string
  proStyle: string
  proHeight: string
  proNationality: string
  proOverall: string
  proOverallStr: string
  manOfTheMatch: string
  redCards: string
  favoritePosition: string
  [key: string]: string
}

export type PositionCount = {
  midfielder: number
  goalkeeper: number
  forward: number
  defender: number
  [key: string]: number
}

export type MembersResponse = {
  members: Member[]
  positionCount: PositionCount
}

export type CustomKit = {
  stadName: string
  kitId: string
  seasonalTeamId: string
  seasonalKitId: string
  selectedKitType: string
  customKitId: string
  customAwayKitId: string
  customThirdKitId: string
  customKeeperKitId: string
  kitColor1: string
  kitColor2: string
  kitColor3: string
  kitColor4: string
  kitAColor1: string
  kitAColor2: string
  kitAColor3: string
  kitAColor4: string
  kitThrdColor1: string
  kitThrdColor2: string
  kitThrdColor3: string
  kitThrdColor4: string
  dCustomKit: string
  crestColor: string
  crestAssetId: string
}

export type ClubInfo = {
  name: string
  clubId: number
  regionId: number
  teamId: number
  customKit: CustomKit
}

export type ClubStats = {
  clubId: string
  wins: string
  losses: string
  ties: string
  gamesPlayed: string
  gamesPlayedPlayoff: string
  goals: string
  goalsAgainst: string
  cleanSheets: string
  points: string
  reputationtier: string
  promotions: string
  relegations: string
  bestDivision: string
  clubInfo: ClubInfo
  platform: string
  clubName: string
  currentDivision: string
}

export type StatsPayload = {
  club: ClubStats
  members: Member[]
  positionCount: PositionCount
  fetchedAt: string
}

const EA_HEADERS: HeadersInit = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  Referer: "https://proclubs.ea.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function fetchEA<T>(
  url: string,
  resourceName: string,
  timeoutMs = 10_000,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: EA_HEADERS,
      cache: "no-store",
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(
        `A API da EA retornou HTTP ${response.status} ao consultar ${resourceName}.`,
      )
    }

    const body = (await response.json()) as unknown
    return body as T
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `A consulta de ${resourceName} excedeu o limite de ${timeoutMs / 1000} segundos.`,
      )
    }

    if (error instanceof Error) throw error

    throw new Error(
      `Não foi possível consultar ${resourceName} na API da EA.`,
    )
  } finally {
    clearTimeout(timeout)
  }
}

export async function getMembers(): Promise<MembersResponse> {
  const response = await fetchEA<unknown>(
    MEMBERS_URL,
    "as estatísticas dos jogadores",
  )

  if (
    !isRecord(response) ||
    !Array.isArray(response.members) ||
    !isRecord(response.positionCount)
  ) {
    throw new Error(
      "A API da EA retornou uma resposta inválida para as estatísticas dos jogadores.",
    )
  }

  return response as MembersResponse
}

export async function getClub(): Promise<ClubStats> {
  const response = await fetchEA<unknown>(
    CLUB_URL,
    "as estatísticas do clube",
  )

  if (!Array.isArray(response)) {
    throw new Error(
      "A API da EA retornou uma resposta inválida para as estatísticas do clube.",
    )
  }

  const clubs = response as ClubStats[]

  const club =
    clubs.find((item) => item.clubId === CLUB_ID) ??
    clubs[0]

  if (!club) {
    throw new Error(
      `O clube ${CLUB_NAME} não foi encontrado na API da EA.`,
    )
  }

  return club
}

export async function getStats(): Promise<StatsPayload> {
  const [club, membersResponse] = await Promise.all([
    getClub(),
    getMembers(),
  ])

  return {
    club,
    members: membersResponse.members,
    positionCount: membersResponse.positionCount,
    fetchedAt: new Date().toISOString(),
  }
}

const POSITION_LABELS: Record<string, string> = {
  "0": "GOL",
  "1": "GOL",
  "2": "ZAG",
  "3": "ZAG",
  "4": "ZAG",
  "5": "ZAG",
  "6": "ZAG",
  "7": "LE",
  "8": "LD",
  "9": "VOL",
  "10": "VOL",
  "12": "MEC",
  "13": "MEC",
  "14": "MC",
  "15": "MD",
  "16": "ME",
  "18": "MEI",
  "19": "MEI",
  "20": "MEI",
  "21": "PE",
  "23": "PD",
  "25": "ATA",
  "26": "ATA",
  "27": "SA",
}

const GROUP_LABELS: Record<string, string> = {
  goalkeeper: "Goleiro",
  defender: "Defensor",
  midfielder: "Meio-campo",
  forward: "Atacante",
}

export function positionLabel(proPos: string): string {
  return POSITION_LABELS[proPos] ?? "—"
}

export function groupLabel(favoritePosition: string): string {
  return GROUP_LABELS[favoritePosition] ?? favoritePosition
}

export function nationalityLabel(id: string): string {
  const nationalities: Record<string, string> = {
    "14": "Inglaterra",
    "18": "Portugal",
    "52": "Argentina",
    "54": "Brasil",
  }

  return nationalities[id] ?? "—"
}

export function last10Goals(member: Member): number[] {
  return Array.from(
    { length: 10 },
    (_, index) => Number(member[`prevGoals${index + 1}`] ?? "0"),
  )
}

export function gaTotal(member: Member): number {
  return Number(member.goals ?? "0") + Number(member.assists ?? "0")
}

export function gaPerGame(member: Member): number {
  const games = Number(member.gamesPlayed ?? "0")
  return games > 0 ? gaTotal(member) / games : 0
}

export const MEMBER_FIELD_LABELS: Record<string, string> = {
  name: "Nome (conta)",
  proName: "Nome do Pro",
  gamesPlayed: "Jogos disputados",
  winRate: "Taxa de vitórias (%)",
  goals: "Gols",
  assists: "Assistências",
  cleanSheetsDef: "Clean sheets (defensor)",
  cleanSheetsGK: "Clean sheets (goleiro)",
  shotSuccessRate: "Aproveitamento de finalização (%)",
  passesMade: "Passes realizados",
  passSuccessRate: "Aproveitamento de passe (%)",
  ratingAve: "Nota média",
  tacklesMade: "Desarmes realizados",
  tackleSuccessRate: "Aproveitamento de desarme (%)",
  proPos: "Posição (código)",
  proStyle: "Estilo (código)",
  proHeight: "Altura (cm)",
  proNationality: "Nacionalidade (código)",
  proOverall: "Overall",
  proOverallStr: "Overall (texto)",
  manOfTheMatch: "Melhor em campo",
  redCards: "Cartões vermelhos",
  favoritePosition: "Posição favorita",
}