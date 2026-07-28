import {
    Activity,
    Award,
    Crosshair,
    Goal,
    Handshake,
    Medal,
    Sparkles,
    Trophy,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type {
    HighlightKey,
    HighlightResponse,
} from "@/src/types/responses/ea"

const ICONS: Record<HighlightKey, LucideIcon> = {
    topScorer: Goal,
    topAssister: Handshake,
    bestAverageRating: Medal,
    mostGoalContributions: Activity,
    mostManOfTheMatch: Trophy,
    bestShotEfficiency: Crosshair,
    bestPassAccuracy: Award,
    mostConsistent: Sparkles,
}

export function HighlightsSection({ highlights, }: { highlights: HighlightResponse[] }) {
    return (
        <section className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                    Destaques
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Líderes calculados com base nas últimas 10 partidas
                    do clube.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {highlights.map((highlight) => {
                    const Icon = ICONS[highlight.key]
                    return (
                        <article
                            key={highlight.key}
                            className="rounded-2xl border border-border bg-card p-5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-card-foreground">
                                        {highlight.title}
                                    </h3>

                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        {highlight.description}
                                    </p>
                                </div>

                                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                                    <Icon
                                        className="size-5 text-blue-400"
                                        aria-hidden="true"
                                    />
                                </span>
                            </div>

                            {highlight.winners.length === 0 ? (
                                <p className="mt-5 text-sm text-muted-foreground">
                                    Dados insuficientes.
                                </p>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {highlight.winners.map((winner) => (
                                        <div
                                            key={winner.playerId}
                                            className="rounded-xl bg-secondary/60 px-3 py-3"
                                        >
                                            <div className="truncate font-semibold text-card-foreground">
                                                {winner.playerName}
                                            </div>

                                            <div className="mt-1 font-mono text-sm font-bold text-primary">
                                                {winner.displayValue}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>
        </section>
    )
}