"use client"

import { useMemo, useState } from "react"
import { BarChart3, Goal, Handshake, LineChart } from "lucide-react"
import type { RecentPlayerStatsResponse } from "@/src/types/responses/ea"

const CHART_WIDTH = 800
const CHART_HEIGHT = 280
const PADDING = { top: 18, right: 22, bottom: 46, left: 42 }
const RATING_TICKS = [0, 2, 4, 6, 8, 10]

function formatDecimal(value: number, digits = 1): string {
    return value.toFixed(digits).replace(".", ",")
}

function formatShortDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(value))
}

function GoalsAssistsChart({
    players,
}: {
    players: RecentPlayerStatsResponse[]
}) {
    const ranking = useMemo(
        () =>
            [...players].sort(
                (left, right) =>
                    right.goalContributions - left.goalContributions ||
                    right.goals - left.goals ||
                    left.playerName.localeCompare(right.playerName, "pt-BR"),
            ),
        [players],
    )

    const maximum = Math.max(
        1,
        ...ranking.flatMap((player) => [
            player.goals,
            player.assists,
        ]),
    )

    return (
        <article className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-card-foreground">
                        Gols e assistências
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Comparativo dos jogadores nas últimas 10 partidas do clube.
                    </p>
                </div>

                <BarChart3
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                />
            </div>

            {ranking.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Dados insuficientes.
                </p>
            ) : (
                <div className="mt-5 space-y-4">
                    {ranking.map((player) => (
                        <div
                            key={player.playerId}
                            className="grid min-w-0 grid-cols-[minmax(90px,150px)_minmax(0,1fr)_auto] items-center gap-3"
                        >
                            <span className="truncate text-sm font-medium text-card-foreground">
                                {player.playerName}
                            </span>

                            <div className="min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Goal
                                        className="size-3.5 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />

                                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${(player.goals / maximum) * 100
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Handshake
                                        className="size-3.5 shrink-0 text-accent"
                                        aria-hidden="true"
                                    />

                                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className="h-full rounded-full bg-accent"
                                            style={{
                                                width: `${(player.assists / maximum) * 100
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
                                <span className="text-primary">
                                    {player.goals}G
                                </span>

                                <span className="text-accent-foreground">
                                    {player.assists}A
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </article>
    )
}

function RatingEvolutionChart({
    players,
}: {
    players: RecentPlayerStatsResponse[]
}) {
    const orderedPlayers = useMemo(
        () =>
            [...players]
                .filter((player) => player.matches.length > 0)
                .sort(
                    (left, right) =>
                        right.gamesPlayed - left.gamesPlayed ||
                        right.averageRating - left.averageRating,
                ),
        [players],
    )

    const [selectedPlayerId, setSelectedPlayerId] = useState("")

    const selectedPlayer =
        orderedPlayers.find(
            (player) => player.playerId === selectedPlayerId,
        ) ??
        orderedPlayers[0] ??
        null

    const matches = useMemo(
        () =>
            selectedPlayer
                ? [...selectedPlayer.matches].sort((left, right) =>
                    left.playedAt.localeCompare(right.playedAt),
                )
                : [],
        [selectedPlayer],
    )

    const plotWidth =
        CHART_WIDTH - PADDING.left - PADDING.right

    const plotHeight =
        CHART_HEIGHT - PADDING.top - PADDING.bottom

    const points = matches.map((match, index) => {
        const x =
            matches.length === 1
                ? PADDING.left + plotWidth / 2
                : PADDING.left +
                (index / (matches.length - 1)) * plotWidth

        const rating = Math.max(
            0,
            Math.min(10, match.rating),
        )

        const y =
            PADDING.top +
            ((10 - rating) / 10) * plotHeight

        return {
            x,
            y,
            match,
        }
    })

    const averageY = selectedPlayer
        ? PADDING.top +
        ((10 - selectedPlayer.averageRating) / 10) *
        plotHeight
        : 0

    return (
        <article className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-card-foreground">
                        Evolução das notas
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Nota recebida pelo jogador em cada partida disputada.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <LineChart
                        className="size-5 text-primary"
                        aria-hidden="true"
                    />

                    <select
                        value={selectedPlayer?.playerId ?? ""}
                        onChange={(event) =>
                            setSelectedPlayerId(event.target.value)
                        }
                        className="max-w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary"
                        aria-label="Selecionar jogador"
                    >
                        {orderedPlayers.map((player) => (
                            <option
                                key={player.playerId}
                                value={player.playerId}
                            >
                                {player.playerName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedPlayer || points.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Dados insuficientes.
                </p>
            ) : (
                <>
                    <div className="mt-4 w-full">
                        <svg
                            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                            className="h-auto w-full"
                            role="img"
                            aria-label={`Evolução das notas de ${selectedPlayer.playerName}`}
                        >
                            {RATING_TICKS.map((tick) => {
                                const y =
                                    PADDING.top +
                                    ((10 - tick) / 10) * plotHeight

                                return (
                                    <g key={tick}>
                                        <line
                                            x1={PADDING.left}
                                            x2={
                                                CHART_WIDTH - PADDING.right
                                            }
                                            y1={y}
                                            y2={y}
                                            stroke="currentColor"
                                            className="text-border"
                                            strokeWidth="1"
                                        />

                                        <text
                                            x={PADDING.left - 10}
                                            y={y + 4}
                                            textAnchor="end"
                                            fill="currentColor"
                                            className="text-[11px] text-muted-foreground"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                )
                            })}

                            <line
                                x1={PADDING.left}
                                x2={CHART_WIDTH - PADDING.right}
                                y1={averageY}
                                y2={averageY}
                                stroke="currentColor"
                                className="text-muted-foreground"
                                strokeWidth="1.5"
                                strokeDasharray="6 6"
                            />

                            <polyline
                                points={points
                                    .map(
                                        (point) =>
                                            `${point.x},${point.y}`,
                                    )
                                    .join(" ")}
                                fill="none"
                                stroke="currentColor"
                                className="text-primary"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {points.map(({ x, y, match }) => (
                                <g key={match.matchId}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="6"
                                        fill="currentColor"
                                        className="text-primary"
                                    >
                                        <title>
                                            {`${formatShortDate(
                                                match.playedAt,
                                            )} · ${match.opponentName
                                                } · Nota ${formatDecimal(
                                                    match.rating,
                                                )}`}
                                        </title>
                                    </circle>

                                    <text
                                        x={x}
                                        y={CHART_HEIGHT - 18}
                                        textAnchor="middle"
                                        fill="currentColor"
                                        className="text-[11px] text-muted-foreground"
                                    >
                                        {formatShortDate(
                                            match.playedAt,
                                        )}
                                    </text>

                                    <text
                                        x={x}
                                        y={Math.max(
                                            PADDING.top + 12,
                                            y - 12,
                                        )}
                                        textAnchor="middle"
                                        fill="currentColor"
                                        className="text-[11px] font-semibold text-card-foreground"
                                    >
                                        {formatDecimal(
                                            match.rating,
                                        )}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                            Média:{" "}
                            <strong className="text-card-foreground">
                                {formatDecimal(
                                    selectedPlayer.averageRating,
                                    2,
                                )}
                            </strong>
                        </span>

                        <span>
                            A linha tracejada representa a nota média.
                        </span>
                    </div>
                </>
            )}
        </article>
    )
}

export function RecentPlayerCharts({
    players,
}: {
    players: RecentPlayerStatsResponse[]
}) {
    return (
        <section className="grid gap-4 xl:grid-cols-2">
            <GoalsAssistsChart players={players} />

            <RatingEvolutionChart players={players} />
        </section>
    )
}