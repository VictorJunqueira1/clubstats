"use client"

import {
  useMemo,
  useState,
} from "react"
import { ArrowUpDown, Crosshair, Flag, Gamepad2, Goal, Handshake, Medal, Percent, Ruler, ShieldCheck, Square, Star, Target, Trophy, Zap } from "lucide-react"
import type {
  MemberResponse as Member,
  RecentPlayerStatsResponse,
} from "@/src/types/responses/ea"
import { gaPerGame, gaTotal, groupLabel, MEMBER_FIELD_LABELS, nationalityLabel, positionLabel } from "@/src/lib/ea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { PlayerRecentDetails } from "@/src/components/player-recent-details"
import { RecentPlayersTable } from "@/src/components/recent-players-table"
import { RecentPlayerCharts } from "@/src/components/recent-player-charts"

type SortKey =
  | "proOverall"
  | "ga"
  | "goals"
  | "assists"
  | "ratingAve"
  | "gamesPlayed"
  | "winRate"

const SORTS: {
  key: SortKey
  label: string
}[] = [
    {
      key: "proOverall",
      label: "Overall",
    },
    {
      key: "ga",
      label: "G/A",
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
      key: "ratingAve",
      label: "Nota",
    },
    {
      key: "gamesPlayed",
      label: "Jogos",
    },
    {
      key: "winRate",
      label: "Vitórias %",
    },
  ]

function sortValue(
  member: Member,
  key: SortKey,
): number {
  if (key === "ga") return gaTotal(member)

  return Number(member[key])
}

function overallColor(overall: number): string {
  if (overall >= 89) return "var(--color-accent)"
  if (overall >= 85) return "var(--color-primary)"

  return "var(--color-muted-foreground)"
}

function normalizePlayerName(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
}

export function PlayersSection({
  members,
  recentPlayers,
}: {
  members: Member[]
  recentPlayers: RecentPlayerStatsResponse[]
}) {
  const [sort, setSort] =
    useState<SortKey>("proOverall")

  const [selected, setSelected] =
    useState<Member | null>(null)

  const sorted = useMemo(
    () =>
      [...members].sort(
        (left, right) =>
          sortValue(right, sort) -
          sortValue(left, sort),
      ),
    [members, sort],
  )

  const selectedRecent = selected
    ? recentPlayers.find((player) => {
      const playerName = normalizePlayerName(
        player.playerName,
      )

      return (
        playerName ===
        normalizePlayerName(selected.name) ||
        playerName ===
        normalizePlayerName(selected.proName)
      )
    }) ?? null
    : null

  function handleRecentPlayerSelect(
    player: RecentPlayerStatsResponse,
  ): void {
    const playerName = normalizePlayerName(
      player.playerName,
    )

    const member = members.find(
      (item) =>
        playerName ===
        normalizePlayerName(item.name) ||
        playerName ===
        normalizePlayerName(item.proName),
    )

    if (member) {
      setSelected(member)
    }
  }

  return (
    <div className="space-y-8">
      <RecentPlayersTable
        players={recentPlayers}
        onSelectPlayer={handleRecentPlayerSelect}
      />

      <RecentPlayerCharts players={recentPlayers} />

      <GaRanking
        members={members}
        onSelect={setSelected}
      />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ArrowUpDown
              className="size-3.5"
              aria-hidden="true"
            />

            Ordenar por
          </span>

          {SORTS.map((sortOption) => (
            <button
              key={sortOption.key}
              type="button"
              onClick={() =>
                setSort(sortOption.key)
              }
              className={`rounded-full px-3 py-1 text-sm transition-colors ${sort === sortOption.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
            >
              {sortOption.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((member) => (
            <PlayerCard
              key={member.name}
              member={member}
              onSelect={() =>
                setSelected(member)
              }
            />
          ))}
        </div>
      </div>

      <PlayerDialog
        member={selected}
        recentStats={selectedRecent}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

function GaRanking({
  members,
  onSelect,
}: {
  members: Member[]
  onSelect: (member: Member) => void
}) {
  const ranked = useMemo(
    () =>
      [...members].sort(
        (left, right) =>
          gaTotal(right) - gaTotal(left),
      ),
    [members],
  )

  const max = Math.max(
    1,
    ...ranked.map(gaTotal),
  )

  function medal(index: number) {
    if (index === 0) {
      return {
        background: "#FFD700",
        color: "#000",
      }
    }

    if (index === 1) {
      return {
        background: "#C0C0C0",
        color: "#000",
      }
    }

    if (index === 2) {
      return {
        background: "#CD7F32",
        color: "#000",
      }
    }

    return {
      background: "#000",
      color: "#fff",
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap
          className="size-5 text-[#FFD700]"
          aria-hidden="true"
        />

        <h2 className="text-lg font-semibold text-card-foreground">
          Ranking G/A
        </h2>

        <span className="text-sm text-muted-foreground">
          · Participações em gol
        </span>
      </div>

      <ol className="space-y-2">
        {ranked.map((member, index) => {
          const total = gaTotal(member)

          return (
            <li key={member.name}>
              <button
                type="button"
                onClick={() => onSelect(member)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-secondary/40 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold"
                  style={medal(index)}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold text-card-foreground">
                      {member.proName}
                    </span>

                    <span className="shrink-0 font-mono text-sm">
                      <span className="font-bold text-gray-200">
                        {total}
                      </span>

                      <span className="text-muted-foreground">
                        {" "}G/A
                      </span>
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${(total / max) * 100
                          }%`,
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>
                      {member.goals} G
                    </span>

                    <span>
                      {member.assists} A
                    </span>

                    <span>
                      {gaPerGame(member).toFixed(2)} por jogo
                    </span>
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

function PlayerCard({
  member,
  onSelect,
}: {
  member: Member
  onSelect: () => void
}) {
  const overall = Number(member.proOverall)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white font-mono leading-none text-black">
          <span className="text-2xl font-bold">
            {overall}
          </span>

          <span className="text-[10px] font-medium opacity-80">
            {positionLabel(member.proPos)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-card-foreground">
            {member.proName}
          </div>

          <div className="truncate text-sm text-muted-foreground">
            {member.name}
          </div>

          <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star
              className="size-3 fill-accent text-yellow-400"
              aria-hidden="true"
            />

            {member.ratingAve} ·{" "}
            {groupLabel(member.favoritePosition)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
          <Zap
            className="size-3.5 text-yellow-400"
            aria-hidden="true"
          />

          Participações G/A
        </span>

        <span className="font-mono text-sm font-bold text-gray-200">
          {gaTotal(member)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MiniStat
          icon={Goal}
          value={member.goals}
          label="Gols"
        />

        <MiniStat
          icon={Handshake}
          value={member.assists}
          label="Assist."
        />

        <MiniStat
          icon={Gamepad2}
          value={member.gamesPlayed}
          label="Jogos"
        />
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
      <Icon
        className="mx-auto size-3.5 text-muted-foreground"
        aria-hidden="true"
      />

      <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-card-foreground">
        {value}
      </div>

      <div className="text-[10px] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

function PlayerDialog({
  member,
  recentStats,
  onClose,
}: {
  member: Member | null
  recentStats: RecentPlayerStatsResponse | null
  onClose: () => void
}) {
  return (
    <Dialog
      open={Boolean(member)}
      onOpenChange={(open: boolean) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-2xl">
        {member ? (
          <PlayerDetail
            member={member}
            recentStats={recentStats}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

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

function displayValue(
  member: Member,
  key: string,
): string {
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

function PlayerDetail({
  member,
  recentStats,
}: {
  member: Member
  recentStats: RecentPlayerStatsResponse | null
}) {
  const overall = Number(member.proOverall)
  const ga = gaTotal(member)

  const highlights: {
    icon: typeof Goal
    label: string
    value: string
  }[] = [
      {
        icon: Percent,
        label: "Vitórias",
        value: `${member.winRate}%`,
      },
      {
        icon: Crosshair,
        label: "Finalização",
        value: `${member.shotSuccessRate}%`,
      },
      {
        icon: Handshake,
        label: "Passes certos",
        value: `${member.passSuccessRate}%`,
      },
      {
        icon: Target,
        label: "Passes realizados",
        value: member.passesMade,
      },
      {
        icon: ShieldCheck,
        label: "Desarmes",
        value:
          `${member.tacklesMade} ` +
          `(${member.tackleSuccessRate}%)`,
      },
      {
        icon: Trophy,
        label: "Melhor em campo",
        value: member.manOfTheMatch,
      },
      {
        icon: Square,
        label: "Cartões vermelhos",
        value: member.redCards,
      },
      {
        icon: Medal,
        label: "Clean sheets DEF/GK",
        value:
          `${member.cleanSheetsDef} / ` +
          `${member.cleanSheetsGK}`,
      },
      {
        icon: Ruler,
        label: "Altura",
        value: `${member.proHeight} cm`,
      },
      {
        icon: Flag,
        label: "Nacionalidade",
        value: nationalityLabel(
          member.proNationality,
        ),
      },
    ]

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div
            className="flex size-16 flex-col items-center justify-center rounded-xl font-mono leading-none"
            style={{
              background: overallColor(overall),
              color:
                "var(--color-primary-foreground)",
            }}
          >
            <span className="text-3xl font-bold">
              {overall}
            </span>

            <span className="text-[10px] font-medium opacity-80">
              {positionLabel(member.proPos)}
            </span>
          </div>

          <div className="text-left">
            <DialogTitle className="text-xl">
              {member.proName}
            </DialogTitle>

            <DialogDescription>
              {member.name} ·{" "}
              {groupLabel(
                member.favoritePosition,
              )}{" "}
              · Nota {member.ratingAve}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <PlayerRecentDetails stats={recentStats} />

      <div className="mt-6 border-t border-border pt-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Estatísticas gerais da carreira no clube
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <BigStat
          value={member.goals}
          label="Gols"
        />

        <BigStat
          value={member.assists}
          label="Assistências"
        />

        <BigStat
          value={String(ga)}
          label="G/A"
        />

        <BigStat
          value={member.gamesPlayed}
          label="Jogos"
        />
      </div>

      <div className="mt-2 rounded-xl bg-accent/10 px-4 py-2.5 text-center text-sm">
        <span className="font-mono font-bold text-gray-200">
          {gaPerGame(member).toFixed(2)}
        </span>

        <span className="text-muted-foreground">
          {" "}participações em gol por jogo
        </span>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {highlights.map((highlight) => (
          <div
            key={highlight.label}
            className="flex items-center justify-between border-b border-border py-2"
          >
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <highlight.icon
                className="size-4"
                aria-hidden="true"
              />

              {highlight.label}
            </span>

            <span className="font-mono text-sm font-medium text-card-foreground">
              {highlight.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Todos os dados
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {RAW_FIELD_ORDER.map(
                (key, index) => (
                  <tr
                    key={key}
                    className={
                      index % 2 === 0
                        ? "bg-secondary/30"
                        : ""
                    }
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {MEMBER_FIELD_LABELS[key] ??
                        key}
                    </td>

                    <td className="px-3 py-2 text-right font-mono font-medium text-card-foreground">
                      {displayValue(member, key)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function BigStat({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl bg-secondary/60 py-3">
      <div className="font-mono text-2xl font-bold tabular-nums text-card-foreground">
        {value}
      </div>

      <div className="text-xs text-muted-foreground">
        {label}
      </div>
    </div>
  )
}