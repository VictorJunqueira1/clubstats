"use client"

import { useMemo, useState, type ComponentType } from "react"
import type { MemberResponse as Member } from "@/src/types/responses/ea"
import { positionLabel, groupLabel, nationalityLabel, gaTotal, gaPerGame } from "@/src/lib/ea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { BadgeCheck, GitCompareArrows, Shield, SportShoe, Target, Trophy, } from "lucide-react"

// Cada métrica sabe extrair seu valor e se "maior é melhor".
type Metric = {
  label: string
  get: (m: Member) => number
  higherBetter: boolean
  format: (value: number) => string
  deltaDecimals?: number
}

type MetricGroup = {
  title: string
  icon: ComponentType<{ className?: string }>
  metrics: Metric[]
}

const METRIC_GROUPS: MetricGroup[] = [
  {
    title: "Geral",
    icon: BadgeCheck,
    metrics: [
      { label: "Overall", get: (m) => Number(m.proOverall), higherBetter: true, format: (v) => String(v) },
      { label: "Nota média", get: (m) => Number(m.ratingAve), higherBetter: true, format: (v) => v.toFixed(1), deltaDecimals: 1 },
      { label: "Jogos", get: (m) => Number(m.gamesPlayed), higherBetter: true, format: (v) => String(v) },
      { label: "Vitórias", get: (m) => Number(m.winRate), higherBetter: true, format: (v) => `${v}%` },
      { label: "Melhor em campo", get: (m) => Number(m.manOfTheMatch), higherBetter: true, format: (v) => String(v) },
      { label: "Cartões vermelhos", get: (m) => Number(m.redCards), higherBetter: false, format: (v) => String(v) }
    ],
  },
  {
    title: "Ataque",
    icon: Target,
    metrics: [
      { label: "Gols", get: (m) => Number(m.goals), higherBetter: true, format: (v) => String(v) },
      { label: "Assistências", get: (m) => Number(m.assists), higherBetter: true, format: (v) => String(v) },
      { label: "G/A (participações)", get: (m) => gaTotal(m), higherBetter: true, format: (v) => String(v) },
      { label: "G/A por jogo", get: (m) => gaPerGame(m), higherBetter: true, format: (v) => v.toFixed(2), deltaDecimals: 2 },
      { label: "Finalização", get: (m) => Number(m.shotSuccessRate), higherBetter: true, format: (v) => `${v}%` },
    ],
  },
  {
    title: "Passe",
    icon: SportShoe,
    metrics: [
      { label: "Passes realizados", get: (m) => Number(m.passesMade), higherBetter: true, format: (v) => String(v) },
      { label: "Acerto de passe", get: (m) => Number(m.passSuccessRate), higherBetter: true, format: (v) => `${v}%` },
    ],
  },
  {
    title: "Defesa",
    icon: Shield,
    metrics: [
      { label: "Desarmes", get: (m) => Number(m.tacklesMade), higherBetter: true, format: (v) => String(v) },
      { label: "Acerto de desarme", get: (m) => Number(m.tackleSuccessRate), higherBetter: true, format: (v) => `${v}%` },
    ],
  }
]

function formatMetricDelta(metric: Metric, leftValue: number, rightValue: number): string {
  const difference = Math.abs(leftValue - rightValue)
  return `+${difference.toFixed(metric.deltaDecimals ?? 0)}`
}

function overallColor(ovr: number): string {
  if (ovr >= 89) return "var(--color-white)"
  if (ovr >= 85) return "var(--color-white)"
  return "var(--color-muted-foreground)"
}

export function CompareSection({ members }: { members: Member[] }) {
  const [leftName, setLeftName] = useState(members[0]?.name ?? "")
  const [rightName, setRightName] = useState(members[1]?.name ?? members[0]?.name ?? "")

  const left = useMemo(() => members.find((m) => m.name === leftName) ?? members[0], [members, leftName])
  const right = useMemo(() => members.find((m) => m.name === rightName) ?? members[1], [members, rightName])

  const tally = useMemo(() => {
    let l = 0
    let r = 0

    for (const group of METRIC_GROUPS) {
      for (const metric of group.metrics) {
        const lv = metric.get(left)
        const rv = metric.get(right)
        if (lv === rv) continue

        const leftWins = metric.higherBetter ? lv > rv : lv < rv
        if (leftWins) l++
        else r++
      }
    }

    return { l, r }
  }, [left, right])

  if (!left || !right) {
    return <p className="text-sm text-muted-foreground">Não há jogadores suficientes para comparar.</p>
  }

  const sameProfile = left.name === right.name

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GitCompareArrows className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">Comparar jogadores</h2>
        <span className="text-sm text-muted-foreground">· Escolha dois jogadores do elenco</span>
      </div>

      {/* Seletores + cartões */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <PlayerPicker
          members={members}
          value={leftName}
          onChange={setLeftName}
          member={left}
          score={tally.l}
          winner={tally.l > tally.r}
        />
        <PlayerPicker
          members={members}
          value={rightName}
          onChange={setRightName}
          member={right}
          score={tally.r}
          winner={tally.r > tally.l}
        />
      </div>

      {sameProfile ? (
        <p className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-center text-sm text-muted-foreground">
          Selecione dois jogadores diferentes para ver a comparação.
        </p>
      ) : (
        <div className="space-y-3">
          {METRIC_GROUPS.map((group) => {
            const GroupIcon = group.icon

            return (
              <div key={group.title} className="overflow-hidden rounded-xl border border-border/60 bg-background/70">
                <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-200 sm:px-4">
                  <GroupIcon className="size-3.5" aria-hidden="true" />
                  <span>{group.title}</span>
                </div>

                {group.metrics.map((metric) => {
                  const leftValue = metric.get(left)
                  const rightValue = metric.get(right)
                  const tie = leftValue === rightValue
                  const leftWins = !tie && (metric.higherBetter ? leftValue > rightValue : leftValue < rightValue)
                  const rightWins = !tie && !leftWins
                  const delta = formatMetricDelta(metric, leftValue, rightValue)

                  return (
                    <div
                      key={metric.label}
                      className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-4"
                    >
                      <div className="flex items-baseline justify-end gap-1.5 font-mono text-sm tabular-nums sm:text-base">
                        {leftWins ? (
                          <span className="text-xs font-semibold text-emerald-500 sm:text-sm">
                            {delta}
                          </span>
                        ) : null}

                        <span className="font-semibold text-card-foreground">
                          {metric.format(leftValue)}
                        </span>
                      </div>

                      <div className="min-w-24 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:min-w-32 sm:text-xs">
                        {metric.label}
                      </div>

                      <div className="flex items-baseline justify-start gap-1.5 font-mono text-sm tabular-nums sm:text-base">
                        <span className="font-semibold text-card-foreground">
                          {metric.format(rightValue)}
                        </span>

                        {rightWins ? (
                          <span className="text-xs font-semibold text-emerald-500 sm:text-sm">
                            {delta}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {!sameProfile ? (
        <p className="text-center text-xs text-muted-foreground">
          Vence quem tiver a melhor marca em cada categoria. Para cartões vermelhos, menos é melhor.
        </p>
      ) : null}
    </div>
  )
}

function PlayerPicker({
  members,
  value,
  onChange,
  member,
  score,
  winner,
}: {
  members: Member[]
  value: string
  onChange: (name: string) => void
  member: Member
  score: number
  winner: boolean
}) {
  const ovr = Number(member.proOverall)

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl bg-card p-4 text-center transition-colors"
    >
      <Select value={value} onValueChange={(newValue) => {
        if (newValue !== null) onChange(newValue)
      }}>
        <SelectTrigger
          aria-label="Selecionar jogador"
          className="w-full border-border bg-secondary text-sm font-medium text-secondary-foreground focus:ring-primary"
        >
          <SelectValue placeholder="Selecione um jogador" />
        </SelectTrigger>

        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.name} value={m.name}>
              {m.proName} ({m.name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div
        className="flex size-16 flex-col items-center justify-center rounded-xl font-mono leading-none"
        style={{
          background: overallColor(ovr),
          color: "var(--color-primary-foreground)",
        }}
      >
        <span className="text-3xl font-bold">{ovr}</span>
        <span className="text-[10px] font-medium opacity-80">
          {positionLabel(member.proPos)}
        </span>
      </div>

      <div className="min-w-0">
        <div className="truncate font-semibold text-card-foreground">
          {member.proName}
        </div>

        <div className="truncate text-xs text-muted-foreground">
          {groupLabel(member.favoritePosition)} ·{" "}
          {nationalityLabel(member.proNationality)}
        </div>
      </div>

      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${winner
          ? "bg-primary/15 text-primary"
          : "bg-secondary text-muted-foreground"
          }`}
      >
        {winner ? (
          <Trophy className="size-3.5" aria-hidden="true" />
        ) : null}

        {score} {score === 1 ? "categoria" : "categorias"}
      </div>
    </div>
  )
}