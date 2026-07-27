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

const NATIONALITY_LABELS: Record<string, string> = {
    "14": "Inglaterra",
    "18": "Portugal",
    "52": "Argentina",
    "54": "Brasil",
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

export function positionLabel(proPos: string): string {
    return POSITION_LABELS[proPos] ?? "—"
}

export function groupLabel(favoritePosition: string): string {
    return GROUP_LABELS[favoritePosition] ?? favoritePosition
}

export function nationalityLabel(id: string): string {
    return NATIONALITY_LABELS[id] ?? "—"
}