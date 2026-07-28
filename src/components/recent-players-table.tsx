"use client"

import { useMemo, useState } from "react"
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
} from "lucide-react"
import type { RecentPlayerStatsResponse } from "@/src/types/responses/ea"

type SortKey =
    | "playerName"
    | "gamesPlayed"
    | "goals"
    | "assists"
    | "goalContributions"
    | "averageRating"
    | "passAccuracy"
    | "minutesPlayed"
    | "goalContributionsPer90"

type SortDirection = "asc" | "desc"

type Column = {
    key: SortKey
    label: string
    align?: "left" | "center"
}

const COLUMNS: Column[] = [
    {
        key: "playerName",
        label: "Jogador",
        align: "left",
    },
    {
        key: "gamesPlayed",
        label: "Jogos",
    },
    {
        key: "goals",
        label: "Gols",
    },
    {
        key: "assists",
        label: "Assist.",
    },
    {
        key: "goalContributions",
        label: "G+A",
    },
    {
        key: "averageRating",
        label: "Nota",
    },
    {
        key: "passAccuracy",
        label: "Precisão",
    },
    {
        key: "minutesPlayed",
        label: "Minutos",
    },
    {
        key: "goalContributionsPer90",
        label: "G+A/90",
    },
]

function formatDecimal(
    value: number,
    digits = 2,
): string {
    return value.toFixed(digits).replace(".", ",")
}

function comparePlayers(
    left: RecentPlayerStatsResponse,
    right: RecentPlayerStatsResponse,
    key: SortKey,
): number {
    if (key === "playerName") {
        return left.playerName.localeCompare(
            right.playerName,
            "pt-BR",
        )
    }

    return left[key] - right[key]
}

export function RecentPlayersTable({
    players,
    onSelectPlayer,
}: {
    players: RecentPlayerStatsResponse[]
    onSelectPlayer?: (
        player: RecentPlayerStatsResponse,
    ) => void
}) {
    const [sortKey, setSortKey] =
        useState<SortKey>("goalContributions")

    const [sortDirection, setSortDirection] =
        useState<SortDirection>("desc")

    const sortedPlayers = useMemo(() => {
        const direction =
            sortDirection === "asc" ? 1 : -1

        return [...players].sort((left, right) => {
            const comparison = comparePlayers(
                left,
                right,
                sortKey,
            )

            if (comparison !== 0) {
                return comparison * direction
            }

            return (
                right.averageRating -
                left.averageRating
            )
        })
    }, [players, sortDirection, sortKey])

    function handleSort(key: SortKey): void {
        if (sortKey === key) {
            setSortDirection((current) =>
                current === "asc" ? "desc" : "asc",
            )

            return
        }

        setSortKey(key)
        setSortDirection(
            key === "playerName" ? "asc" : "desc",
        )
    }

    function SortIcon({
        columnKey,
    }: {
        columnKey: SortKey
    }) {
        if (sortKey !== columnKey) {
            return (
                <ArrowUpDown
                    className="size-3.5"
                    aria-hidden="true"
                />
            )
        }

        return sortDirection === "asc" ? (
            <ArrowUp
                className="size-3.5"
                aria-hidden="true"
            />
        ) : (
            <ArrowDown
                className="size-3.5"
                aria-hidden="true"
            />
        )
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                    Desempenho nas últimas 10 partidas
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    A tabela considera somente partidas em que o
                    jogador entrou em campo.
                </p>
            </div>

            <div className="max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full min-w-[960px] text-sm">
                    <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            {COLUMNS.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 ${column.align === "left"
                                            ? "text-left"
                                            : "text-center"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSort(column.key)
                                        }
                                        className={`inline-flex items-center gap-1.5 transition-colors hover:text-card-foreground ${column.align === "left"
                                                ? "justify-start"
                                                : "justify-center"
                                            }`}
                                    >
                                        {column.label}

                                        <SortIcon
                                            columnKey={column.key}
                                        />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                        {sortedPlayers.map((player) => (
                            <tr
                                key={player.playerId}
                                className="transition-colors hover:bg-secondary/30"
                            >
                                <td className="px-4 py-3">
                                    {onSelectPlayer ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectPlayer(player)
                                            }
                                            className="font-semibold text-card-foreground transition-colors hover:text-primary"
                                        >
                                            {player.playerName}
                                        </button>
                                    ) : (
                                        <span className="font-semibold text-card-foreground">
                                            {player.playerName}
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-center font-mono tabular-nums">
                                    {player.gamesPlayed}
                                </td>

                                <td className="px-4 py-3 text-center font-mono tabular-nums">
                                    {player.goals}
                                </td>

                                <td className="px-4 py-3 text-center font-mono tabular-nums">
                                    {player.assists}
                                </td>

                                <td className="px-4 py-3 text-center font-mono font-semibold tabular-nums text-card-foreground">
                                    {player.goalContributions}
                                </td>

                                <td className="px-4 py-3 text-center font-mono tabular-nums">
                                    {formatDecimal(
                                        player.averageRating,
                                    )}
                                </td>

                                <td className="px-4 py-3 text-center font-mono tabular-nums">
                                    {formatDecimal(
                                        player.passAccuracy,
                                        1,
                                    )}
                                    %
                                </td>

                                <td className="px-4 py-3 text-center font-mono tabular-nums">
                                    {Math.round(player.minutesPlayed)}
                                </td>

                                <td className="px-4 py-3 text-center font-mono font-semibold tabular-nums text-primary">
                                    {formatDecimal(player.goalContributionsPer90)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedPlayers.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhum jogador participou das partidas
                        recentes.
                    </p>
                ) : null}
            </div>
        </section>
    )
}