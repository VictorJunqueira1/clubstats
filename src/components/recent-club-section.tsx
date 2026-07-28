import {
    CircleEqual,
    CircleMinus,
    CirclePlus,
    Gamepad2,
    Goal,
    Percent,
    ShieldAlert,
    Trophy,
} from "lucide-react"
import { StatCard } from "@/src/components/stat-card"
import type {
    RecentClubStatsResponse,
    RecentMatchResult,
} from "@/src/types/responses/ea"

const RESULT_LABELS: Record<RecentMatchResult, string> = {
    win: "Vitória",
    draw: "Empate",
    loss: "Derrota",
}

const RESULT_CLASSES: Record<RecentMatchResult, string> = {
    win: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    draw: "border-border bg-secondary text-muted-foreground",
    loss: "border-red-500/30 bg-red-500/10 text-red-500",
}

function formatPercentage(value: number): string {
    return `${value.toFixed(1).replace(".", ",")}%`
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

export function RecentClubSection({ clubName, stats, }: { clubName: string; stats: RecentClubStatsResponse }) {
    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                    Últimas 10 partidas
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Recorte recente calculado exclusivamente a partir do
                    histórico de partidas da EA.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    icon={Gamepad2}
                    iconClassName="text-blue-500"
                    label="Jogos"
                    value={stats.gamesPlayed}
                />

                <StatCard
                    icon={Trophy}
                    iconClassName="text-emerald-500"
                    label="Vitórias"
                    value={stats.wins}
                />

                <StatCard
                    icon={CircleEqual}
                    iconClassName="text-zinc-400"
                    label="Empates"
                    value={stats.draws}
                />

                <StatCard
                    icon={CircleMinus}
                    iconClassName="text-red-500"
                    label="Derrotas"
                    value={stats.losses}
                />

                <StatCard
                    icon={Goal}
                    iconClassName="text-emerald-500"
                    label="Gols pró"
                    value={stats.goalsFor}
                />

                <StatCard
                    icon={ShieldAlert}
                    iconClassName="text-red-500"
                    label="Gols contra"
                    value={stats.goalsAgainst}
                />

                <StatCard
                    icon={
                        stats.goalDifference >= 0
                            ? CirclePlus
                            : CircleMinus
                    }
                    iconClassName={
                        stats.goalDifference >= 0
                            ? "text-emerald-500"
                            : "text-red-500"
                    }
                    label="Saldo"
                    value={
                        stats.goalDifference > 0
                            ? `+${stats.goalDifference}`
                            : stats.goalDifference
                    }
                />

                <StatCard
                    icon={Percent}
                    iconClassName="text-primary"
                    label="Aproveitamento"
                    value={formatPercentage(stats.pointsPercentage)}
                    hint={`${stats.points} de ${stats.gamesPlayed * 3} pontos`}
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3 sm:px-5">
                    <h3 className="font-semibold text-card-foreground">
                        Partidas recentes
                    </h3>
                </div>

                {stats.matches.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Nenhuma partida recente foi encontrada.
                    </p>
                ) : (
                    <ol className="divide-y divide-border">
                        {stats.matches.map((match) => (
                            <li
                                key={match.matchId}
                                className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-5"
                            >
                                <span
                                    className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${RESULT_CLASSES[match.result]
                                        }`}
                                >
                                    {RESULT_LABELS[match.result]}
                                </span>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <span className="font-semibold capitalize text-card-foreground">
                                            {clubName}
                                        </span>

                                        <span className="font-mono text-lg font-bold tabular-nums text-card-foreground">
                                            {match.goalsFor} × {match.goalsAgainst}
                                        </span>

                                        <span className="truncate text-sm text-muted-foreground">
                                            {match.opponentName}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <time dateTime={match.playedAt}>
                                            {formatDate(match.playedAt)}
                                        </time>

                                        {match.decidedByDnf ? (
                                            <span>
                                                {match.wonByDnf
                                                    ? "Vitória por desistência"
                                                    : "Partida encerrada por desistência"}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <span className="font-mono text-xs text-muted-foreground">
                                    #{match.matchId}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    )
}