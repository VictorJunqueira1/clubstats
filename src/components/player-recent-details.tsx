import {
  Award,
  Crosshair,
  Gamepad2,
  Goal,
  Handshake,
  Percent,
  Star,
  Target,
  Trophy,
} from "lucide-react"
import type {
  RecentMatchResult,
  RecentPlayerStatsResponse,
} from "@/src/types/responses/ea"

const RESULT_LABELS: Record<RecentMatchResult, string> = {
  win: "V",
  draw: "E",
  loss: "D",
}

const RESULT_CLASSES: Record<RecentMatchResult, string> = {
  win: "bg-emerald-500/15 text-emerald-500",
  draw: "bg-secondary text-muted-foreground",
  loss: "bg-red-500/15 text-red-500",
}

function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits).replace(".", ",")
}

function formatPercentage(value: number): string {
  return `${formatDecimal(value, 1)}%`
}

export function PlayerRecentDetails({
  stats,
}: {
  stats: RecentPlayerStatsResponse | null
}) {
  if (!stats) {
    return (
      <section className="mt-5 rounded-xl border border-border bg-secondary/30 px-4 py-5 text-center">
        <h3 className="font-semibold text-card-foreground">
          Últimas 10 partidas
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          O jogador não participou das partidas recentes retornadas pela API.
        </p>
      </section>
    )
  }

  const summary = [
    {
      icon: Gamepad2,
      label: "Jogos",
      value: String(stats.gamesPlayed),
    },
    {
      icon: Goal,
      label: "Gols",
      value: String(stats.goals),
    },
    {
      icon: Handshake,
      label: "Assistências",
      value: String(stats.assists),
    },
    {
      icon: Trophy,
      label: "G+A",
      value: String(stats.goalContributions),
    },
    {
      icon: Star,
      label: "Nota média",
      value: formatDecimal(stats.averageRating),
    },
    {
      icon: Award,
      label: "Craque da partida",
      value: String(stats.manOfTheMatch),
    },
    {
      icon: Crosshair,
      label: "Finalizações",
      value: String(stats.shots),
    },
    {
      icon: Target,
      label: "Passes certos",
      value: String(stats.passesMade),
    },
  ]

  return (
    <section className="mt-5 min-w-0 max-w-full space-y-4 overflow-hidden">
      <div>
        <h3 className="font-semibold text-card-foreground">
          Últimas 10 partidas do clube
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Somente partidas em que o jogador entrou em campo.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-xl bg-secondary/60 p-3"
          >
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <item.icon
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />

              <span className="truncate">
                {item.label}
              </span>
            </div>

            <div className="mt-2 font-mono text-xl font-bold tabular-nums text-card-foreground">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
        <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <span className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <Percent
              className="size-4 shrink-0"
              aria-hidden="true"
            />

            <span className="truncate">
              Precisão nos passes
            </span>
          </span>

          <span className="shrink-0 font-mono font-semibold text-card-foreground">
            {formatPercentage(stats.passAccuracy)}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <span className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <Crosshair
              className="size-4 shrink-0"
              aria-hidden="true"
            />

            <span className="truncate">
              Eficiência nas finalizações
            </span>
          </span>

          <span className="shrink-0 font-mono font-semibold text-card-foreground">
            {formatPercentage(stats.shotEfficiency)}
          </span>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-2.5">
                Partida
              </th>

              <th className="px-2 py-2.5 text-center">
                Gols
              </th>

              <th className="px-2 py-2.5 text-center">
                Assist.
              </th>

              <th className="px-2 py-2.5 text-center">
                G+A
              </th>

              <th className="px-2 py-2.5 text-center">
                Nota
              </th>

              <th className="px-2 py-2.5 text-center">
                Craque
              </th>

              <th className="px-2 py-2.5 text-center">
                Finaliz.
              </th>

              <th className="px-2 py-2.5 text-center">
                Passes certos
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {stats.matches.map((match) => (
              <tr key={match.matchId}>
                <td className="px-3 py-3">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${RESULT_CLASSES[match.result]}`}
                  >
                    {RESULT_LABELS[match.result]}
                  </span>
                </td>

                <td className="px-3 py-3 text-center font-mono">
                  {match.goals}
                </td>

                <td className="px-3 py-3 text-center font-mono">
                  {match.assists}
                </td>

                <td className="px-3 py-3 text-center font-mono font-semibold">
                  {match.goalContributions}
                </td>

                <td className="px-3 py-3 text-center font-mono">
                  {formatDecimal(match.rating, 1)}
                </td>

                <td className="px-3 py-3 text-center">
                  {match.manOfTheMatch ? "Sim" : "—"}
                </td>

                <td className="px-3 py-3 text-center font-mono">
                  {match.shots}
                </td>

                <td className="px-3 py-3 text-center font-mono">
                  {match.passesMade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}