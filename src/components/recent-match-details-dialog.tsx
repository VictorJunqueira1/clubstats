"use client"

import {
    Crosshair,
    Star,
    Target,
    Users,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import type {
    RecentMatchResult,
    RecentMatchSummaryResponse,
    RecentPlayerStatsResponse,
} from "@/src/types/responses/ea"

const RESULT_LABELS: Record<
    RecentMatchResult,
    string
> = {
    win: "Vitória",
    draw: "Empate",
    loss: "Derrota",
}

const RESULT_CLASSES: Record<
    RecentMatchResult,
    string
> = {
    win: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    draw: "border-border bg-secondary text-muted-foreground",
    loss: "border-red-500/30 bg-red-500/10 text-red-500",
}

const POSITION_LABELS: Record<string, string> = {
    goalkeeper: "GOL",
    defender: "DEF",
    midfielder: "MEI",
    forward: "ATA",
}

function formatDecimal(
    value: number,
    digits = 1,
): string {
    return value
        .toFixed(digits)
        .replace(".", ",")
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

export function RecentMatchDetailsDialog({
    clubName,
    match,
    players,
    onClose,
}: {
    clubName: string
    match: RecentMatchSummaryResponse | null
    players: RecentPlayerStatsResponse[]
    onClose: () => void
}) {
    if (!match) return null

    const performances = players
        .map((player) => {
            const performance = player.matches.find(
                (item) =>
                    item.matchId === match.matchId,
            )

            return performance
                ? {
                    playerId: player.playerId,
                    playerName: player.playerName,
                    performance,
                }
                : null
        })
        .filter(
            (
                item,
            ): item is {
                playerId: string
                playerName: string
                performance: RecentPlayerStatsResponse["matches"][number]
            } => item !== null,
        )
        .sort(
            (left, right) =>
                right.performance
                    .goalContributions -
                left.performance
                    .goalContributions ||
                right.performance.rating -
                left.performance.rating,
        )

    const totalShots = performances.reduce(
        (sum, item) =>
            sum + item.performance.shots,
        0,
    )

    const totalPasses = performances.reduce(
        (sum, item) =>
            sum + item.performance.passesMade,
        0,
    )

    const averageRating =
        performances.length > 0
            ? performances.reduce(
                (sum, item) =>
                    sum +
                    item.performance.rating,
                0,
            ) / performances.length
            : 0

    const summary = [
        {
            icon: Users,
            label: "Jogadores",
            value: String(
                performances.length,
            ),
        },
        {
            icon: Crosshair,
            label: "Finalizações",
            value: String(totalShots),
        },
        {
            icon: Target,
            label: "Passes certos",
            value: String(totalPasses),
        },
        {
            icon: Star,
            label: "Nota média",
            value: formatDecimal(
                averageRating,
                2,
            ),
        },
    ]

    return (
        <Dialog
            open
            onOpenChange={(open: boolean) => {
                if (!open) onClose()
            }}
        >
            <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                        <div>
                            <DialogTitle className="text-xl">
                                Detalhes da partida
                            </DialogTitle>

                            <DialogDescription>
                                {formatDate(match.playedAt)}
                            </DialogDescription>
                        </div>

                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${RESULT_CLASSES[match.result]}`}
                        >
                            {RESULT_LABELS[match.result]}
                        </span>
                    </div>
                </DialogHeader>

                <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-5 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-3 text-lg font-semibold text-card-foreground">
                        <span className="capitalize">
                            {clubName}
                        </span>

                        <span className="font-mono text-3xl font-bold tabular-nums">
                            {match.goalsFor} ×{" "}
                            {match.goalsAgainst}
                        </span>

                        <span>
                            {match.opponentName}
                        </span>
                    </div>

                    {match.decidedByDnf ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                            {match.wonByDnf
                                ? "Vitória registrada por desistência do adversário."
                                : "Partida encerrada por desistência."}
                        </p>
                    ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {summary.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl bg-secondary/60 p-3"
                        >
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <item.icon
                                    className="size-3.5"
                                    aria-hidden="true"
                                />

                                {item.label}
                            </div>

                            <div className="mt-2 font-mono text-xl font-bold tabular-nums text-card-foreground">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="max-w-full overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[980px] text-sm">
                        <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-3 py-3 text-left">
                                    Jogador
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Pos.
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Min.
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Gols
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Assist.
                                </th>

                                <th className="px-3 py-3 text-center">
                                    G+A
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Nota
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Finaliz.
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Passes
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Precisão
                                </th>

                                <th className="px-3 py-3 text-center">
                                    Craque
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {performances.map(
                                ({
                                    playerId,
                                    playerName,
                                    performance,
                                }) => {
                                    const passAccuracy =
                                        performance.passAttempts >
                                            0
                                            ? (performance.passesMade /
                                                performance.passAttempts) *
                                            100
                                            : 0

                                    return (
                                        <tr
                                            key={playerId}
                                            className="hover:bg-secondary/30"
                                        >
                                            <td className="px-3 py-3 font-semibold text-card-foreground">
                                                {playerName}
                                            </td>

                                            <td className="px-3 py-3 text-center text-muted-foreground">
                                                {POSITION_LABELS[
                                                    performance.position
                                                ] ??
                                                    performance.position}
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {Math.round(
                                                    performance.secondsPlayed /
                                                    60,
                                                )}
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {performance.goals}
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {performance.assists}
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono font-semibold">
                                                {
                                                    performance.goalContributions
                                                }
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {formatDecimal(
                                                    performance.rating,
                                                )}
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {performance.shots}
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {
                                                    performance.passesMade
                                                }
                                            </td>

                                            <td className="px-3 py-3 text-center font-mono">
                                                {formatDecimal(
                                                    passAccuracy,
                                                )}
                                                %
                                            </td>

                                            <td className="px-3 py-3 text-center">
                                                {performance.manOfTheMatch
                                                    ? "Sim"
                                                    : "—"}
                                            </td>
                                        </tr>
                                    )
                                },
                            )}
                        </tbody>
                    </table>

                    {performances.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Nenhuma atuação foi encontrada para esta partida.
                        </p>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    )
}