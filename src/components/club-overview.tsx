import {
  Trophy,
  Target,
  ShieldCheck,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Goal,
  Award,
  MapPin,
} from "lucide-react"
import type { ClubStatsResponse as ClubStats } from "@/src/types/responses/ea"
import { StatCard } from "@/src/components/stat-card"
import Image from "next/image"

function eaColorToHex(n: string): string {
  const v = Number(n)
  if (!Number.isFinite(v) || v < 0) return "#22c55e"
  const r = (v >> 16) & 255
  const g = (v >> 8) & 255
  const b = v & 255
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

export function ClubOverview({ club }: { club: ClubStats }) {
  const wins = Number(club.wins)
  const losses = Number(club.losses)
  const ties = Number(club.ties)
  const total = wins + losses + ties || 1
  const winPct = Math.round((wins / total) * 100)
  const goals = Number(club.goals)
  const against = Number(club.goalsAgainst)
  const diff = goals - against
  const gpg = (goals / (Number(club.gamesPlayed) || 1)).toFixed(2)

  const kit1 = eaColorToHex(club.clubInfo.customKit.kitColor1)
  const kit2 = eaColorToHex(club.clubInfo.customKit.kitColor2)

  const segments = [
    { label: "Vitórias", value: wins, color: "#22c55e" },
    { label: "Empates", value: ties, color: "var(--color-muted-foreground)" },
    { label: "Derrotas", value: losses, color: "#ef4444" },
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho do clube */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <Image src={"/logo-club.png"} alt={"Logo Club"} width={64} height={64} className="rounded-md" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold capitalize text-card-foreground text-balance">{club.clubName}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {club.clubInfo.customKit.stadName}
            </span>
            <span>Plataforma: Gen5</span>
            <span>ID: {club.clubId}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-accent-foreground px-5 py-3 text-center text-primary-foreground">
            <div className="font-mono text-3xl font-bold leading-none">{club.currentDivision}ª</div>
            <div className="mt-1 text-xs font-medium">Divisão atual</div>
          </div>
          <div className="rounded-xl bg-accent px-5 py-3 text-center text-accent-foreground">
            <div className="font-mono text-3xl font-bold leading-none">{club.bestDivision}ª</div>
            <div className="mt-1 text-xs font-medium">Melhor divisão</div>
          </div>
        </div>
      </div>

      {/* Aproveitamento */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Aproveitamento</h3>
          <span className="font-mono text-sm text-primary">{winPct}% de vitórias</span>
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${wins} vitórias, ${ties} empates, ${losses} derrotas`}>
          {segments.map((s) => (
            <div key={s.label} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {segments.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-2xl font-bold tabular-nums" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade de stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Gamepad2} iconClassName="text-blue-500" label="Partidas" value={club.gamesPlayed} />
        <StatCard icon={Award} iconClassName="text-yellow-500" label="Pontos" value={club.points} />
        <StatCard icon={Goal} iconClassName="text-green-500" label="Gols marcados" value={goals} hint={`${gpg} por jogo`} />
        <StatCard icon={Target} iconClassName="text-red-500" label="Gols sofridos" value={against} />

        <StatCard
          icon={TrendingUp}
          iconClassName={diff >= 0 ? "text-emerald-500" : "text-red-500"}
          label="Saldo de gols"
          value={diff > 0 ? `+${diff}` : diff}
          className={diff >= 0 ? "" : "border-destructive/40"}
        />

        <StatCard icon={ShieldCheck} iconClassName="text-cyan-500" label="Clean sheets" value={club.cleanSheets} />
        <StatCard icon={TrendingUp} iconClassName="text-purple-500" label="Promoções" value={club.promotions} />
        <StatCard icon={TrendingDown} iconClassName="text-orange-500" label="Rebaixamentos" value={club.relegations} />
      </div>
    </div>
  )
}
