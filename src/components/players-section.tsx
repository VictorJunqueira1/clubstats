"use client"

import { useMemo, useState } from "react"
import {
  Star,
  Goal,
  Handshake,
  Gamepad2,
  Percent,
  Crosshair,
  ShieldCheck,
  Ruler,
  Flag,
  ArrowUpDown,
  Zap,
  Trophy,
  Medal,
  Square,
  Target,
} from "lucide-react"
import type { MemberResponse as Member } from "@/src/types/responses/ea"
import {
  positionLabel,
  groupLabel,
  nationalityLabel,
  last10Goals,
  gaTotal,
  gaPerGame,
  MEMBER_FIELD_LABELS,
} from "@/src/lib/ea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog"

type SortKey = "proOverall" | "ga" | "goals" | "assists" | "ratingAve" | "gamesPlayed" | "winRate"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "proOverall", label: "Overall" },
  { key: "ga", label: "G/A" },
  { key: "goals", label: "Gols" },
  { key: "assists", label: "Assist." },
  { key: "ratingAve", label: "Nota" },
  { key: "gamesPlayed", label: "Jogos" },
  { key: "winRate", label: "Vitórias %" },
]

function sortValue(m: Member, key: SortKey): number {
  if (key === "ga") return gaTotal(m)
  return Number(m[key])
}

function overallColor(ovr: number): string {
  if (ovr >= 89) return "var(--color-accent)"
  if (ovr >= 85) return "var(--color-primary)"
  return "var(--color-muted-foreground)"
}

export function PlayersSection({ members }: { members: Member[] }) {
  const [sort, setSort] = useState<SortKey>("proOverall")
  const [selected, setSelected] = useState<Member | null>(null)

  const sorted = useMemo(
    () => [...members].sort((a, b) => sortValue(b, sort) - sortValue(a, sort)),
    [members, sort],
  )

  return (
    <div className="space-y-8">
      <GaRanking members={members} onSelect={setSelected} />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ArrowUpDown className="size-3.5" aria-hidden="true" /> Ordenar por
          </span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${sort === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((m) => (
            <PlayerCard key={m.name} member={m} onSelect={() => setSelected(m)} />
          ))}
        </div>
      </div>

      <PlayerDialog member={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

/* ---------------- Ranking de G/A (Gols + Assistências) ---------------- */

function GaRanking({
  members,
  onSelect,
}: {
  members: Member[]
  onSelect: (m: Member) => void
}) {
  const ranked = useMemo(
    () => [...members].sort((a, b) => gaTotal(b) - gaTotal(a)),
    [members],
  )
  const max = Math.max(1, ...ranked.map(gaTotal))

  const medal = (index: number) => {
    if (index === 0) return { background: "#FFD700", color: "#000" }
    if (index === 1) return { background: "#C0C0C0", color: "#000" }
    if (index === 2) return { background: "#CD7F32", color: "#000" }

    return { background: "#000", color: "#fff" }
  }

  //   const medal = (i: number) => {
  //   if (i === 0) return "#FFD700"
  //   if (i === 1) return "#C0C0C0"
  //   if (i === 2) return "#C0C0C0"
  //   return "#000"
  // }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="size-5 text-[#FFD700]" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-card-foreground">Ranking G/A</h2>
        <span className="text-sm text-muted-foreground">· Participações em gol (Gols + Assistências)</span>
      </div>

      <ol className="space-y-2">
        {ranked.map((m, i) => {
          const total = gaTotal(m)
          return (
            <li key={m.name}>
              <button
                onClick={() => onSelect(m)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-secondary/40 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold"
                  style={medal(i)}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold text-card-foreground">{m.proName}</span>
                    <span className="shrink-0 font-mono text-sm">
                      <span className="font-bold text-gray-200">{total}</span>
                      <span className="text-muted-foreground"> G/A</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(total / max) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>{m.goals} G</span>
                    <span>{m.assists} A</span>
                    <span>{gaPerGame(m).toFixed(2)} por jogo</span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/* ---------------- Cartão de jogador ---------------- */

function PlayerCard({ member, onSelect }: { member: Member; onSelect: () => void }) {
  const ovr = Number(member.proOverall)
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl font-mono leading-none bg-white text-black"
        >
          <span className="text-2xl font-bold">{ovr}</span>
          <span className="text-[10px] font-medium opacity-80">{positionLabel(member.proPos)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-card-foreground">{member.proName}</div>
          <div className="truncate text-sm text-muted-foreground">{member.name}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-accent text-yellow-400" aria-hidden="true" />
            {member.ratingAve} · {groupLabel(member.favoritePosition)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
          <Zap className="size-3.5 text-yellow-400" aria-hidden="true" /> Participações (G/A)
        </span>
        <span className="font-mono text-sm font-bold text-gray-200">{gaTotal(member)}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MiniStat icon={Goal} value={member.goals} label="Gols" />
        <MiniStat icon={Handshake} value={member.assists} label="Assist." />
        <MiniStat icon={Gamepad2} value={member.gamesPlayed} label="Jogos" />
      </div>

      <span className="mt-4 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Ver detalhes →
      </span>
    </button>
  )
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Goal
  value: string
  label: string
}) {
  return (
    <div className="rounded-lg bg-secondary/60 py-2">
      <Icon className="mx-auto size-3.5 text-muted-foreground" aria-hidden="true" />
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-card-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}

/* ---------------- Diálogo de detalhes ---------------- */

function PlayerDialog({ member, onClose }: { member: Member | null; onClose: () => void }) {
  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {member ? <PlayerDetail member={member} /> : null}
      </DialogContent>
    </Dialog>
  )
}

// Ordem de exibição de todos os campos crus da resposta.
const RAW_FIELD_ORDER = [
  "name",
  "proName",
  "proOverall",
  "proOverallStr",
  "proPos",
  "favoritePosition",
  "proStyle",
  "proHeight",
  "proNationality",
  "gamesPlayed",
  "winRate",
  "goals",
  "assists",
  "ratingAve",
  "manOfTheMatch",
  "redCards",
  "shotSuccessRate",
  "passesMade",
  "passSuccessRate",
  "tacklesMade",
  "tackleSuccessRate",
  "cleanSheetsDef",
  "cleanSheetsGK",
] as const

// Valor formatado com contexto legível para campos codificados.
function displayValue(member: Member, key: string): string {
  const raw = member[key]
  if (raw == null) return "—"
  switch (key) {
    case "proPos":
      return `${raw} (${positionLabel(raw)})`
    case "favoritePosition":
      return groupLabel(raw)
    case "proNationality":
      return `${raw} (${nationalityLabel(raw)})`
    case "proHeight":
      return `${raw} cm`
    case "winRate":
    case "shotSuccessRate":
    case "passSuccessRate":
    case "tackleSuccessRate":
      return `${raw}%`
    default:
      return raw
  }
}

function PlayerDetail({ member }: { member: Member }) {
  const ovr = Number(member.proOverall)
  const goals = last10Goals(member)
  const maxGoals = Math.max(1, ...goals)
  const ga = gaTotal(member)

  const highlights: { icon: typeof Goal; label: string; value: string; accent?: boolean }[] = [
    { icon: Percent, label: "Vitórias", value: `${member.winRate}%` },
    { icon: Crosshair, label: "Finalização", value: `${member.shotSuccessRate}%` },
    { icon: Handshake, label: "Passes certos", value: `${member.passSuccessRate}%` },
    { icon: Target, label: "Passes realizados", value: member.passesMade },
    { icon: ShieldCheck, label: "Desarmes", value: `${member.tacklesMade} (${member.tackleSuccessRate}%)` },
    { icon: Trophy, label: "Melhor em campo", value: member.manOfTheMatch },
    { icon: Square, label: "Cartões vermelhos", value: member.redCards },
    { icon: Medal, label: "Clean sheets (DEF/GK)", value: `${member.cleanSheetsDef} / ${member.cleanSheetsGK}` },
    { icon: Ruler, label: "Altura", value: `${member.proHeight} cm` },
    { icon: Flag, label: "Nacionalidade", value: nationalityLabel(member.proNationality) },
  ]

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div
            className="flex size-16 flex-col items-center justify-center rounded-xl font-mono leading-none"
            style={{ background: overallColor(ovr), color: "var(--color-primary-foreground)" }}
          >
            <span className="text-3xl font-bold">{ovr}</span>
            <span className="text-[10px] font-medium opacity-80">{positionLabel(member.proPos)}</span>
          </div>
          <div className="text-left">
            <DialogTitle className="text-xl">{member.proName}</DialogTitle>
            <DialogDescription>
              {member.name} · {groupLabel(member.favoritePosition)} · Nota {member.ratingAve}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Destaques: Gols, Assistências, G/A */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <BigStat value={member.goals} label="Gols" />
        <BigStat value={member.assists} label="Assistências" />
        <BigStat value={String(ga)} label="G/A" />
        <BigStat value={member.gamesPlayed} label="Jogos" />
      </div>

      <div className="mt-2 rounded-xl bg-accent/10 px-4 py-2.5 text-center text-sm">
        <span className="font-mono font-bold text-gray-200">{gaPerGame(member).toFixed(2)}</span>
        <span className="text-muted-foreground"> participações em gol por jogo</span>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {highlights.map((r) => (
          <div key={r.label} className="flex items-center justify-between border-b border-border py-2">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <r.icon className="size-4" aria-hidden="true" />
              {r.label}
            </span>
            <span
              className={`font-mono text-sm font-medium ${r.accent ? "text-accent" : "text-card-foreground"}`}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {/* Gols nos últimos 10 jogos */}
      <div className="mt-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Gols nos últimos 10 jogos
        </div>
        <div className="flex h-24 items-end gap-1.5">
          {goals.map((g, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[10px] text-muted-foreground">{g}</span>
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${(g / maxGoals) * 72 + 4}px` }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Todos os dados da API */}
      <div className="mt-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Todos os dados
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {RAW_FIELD_ORDER.map((key, i) => (
                <tr key={key} className={i % 2 === 0 ? "bg-secondary/30" : ""}>
                  <td className="px-3 py-2 text-muted-foreground">
                    {MEMBER_FIELD_LABELS[key] ?? key}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-medium text-card-foreground">
                    {displayValue(member, key)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function BigStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl py-3 ${accent ? "bg-accent/15" : "bg-secondary/60"}`}>
      <div
        className={`font-mono text-2xl font-bold tabular-nums ${accent ? "text-accent" : "text-card-foreground"}`}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
