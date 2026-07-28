"use client"

import useSWR from "swr"
import {
  AlertTriangle,
  GitCompareArrows,
  LoaderCircle,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react"
import { ClubOverview } from "@/src/components/club-overview"
import { CompareSection } from "@/src/components/compare-section"
import { HighlightsSection } from "@/src/components/highlights-section"
import { PlayersSection } from "@/src/components/players-section"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import type {
  StatsResponse as StatsPayload,
} from "@/src/types/responses/ea"

type ApiErrorResponse = {
  message?: string
}

async function fetcher(
  url: string,
): Promise<StatsPayload> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({}))) as ApiErrorResponse

    throw new Error(
      error.message ??
      `Não foi possível carregar os dados. HTTP ${response.status}.`,
    )
  }

  return (await response.json()) as StatsPayload
}

function timeAgo(iso: string): string {
  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() -
        new Date(iso).getTime()) /
      1000,
    ),
  )

  if (seconds < 10) return "agora mesmo"
  if (seconds < 60) return `há ${seconds}s`

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) return `há ${minutes}min`

  return `há ${Math.floor(minutes / 60)}h`
}

export function Dashboard() {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<StatsPayload>(
    "/api/stats",
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  )

  if (isLoading && !data) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle
            className="size-7 animate-spin text-primary"
            aria-hidden="true"
          />

          Consultando a API da EA...
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-card p-6 text-center">
        <AlertTriangle
          className="mx-auto size-8 text-destructive"
          aria-hidden="true"
        />

        <h2 className="mt-3 text-lg font-semibold text-card-foreground">
          Não foi possível carregar as estatísticas
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "A API da EA não respondeu corretamente."}
        </p>

        <button
          type="button"
          onClick={() => void mutate()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw
            className="size-4"
            aria-hidden="true"
          />

          Tentar novamente
        </button>
      </div>
    )
  }

  if (!data) return null

  const {
    club,
    members,
    recent,
    fetchedAt,
  } = data

  return (
    <div className="space-y-5">
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />

          <span>
            A última atualização falhou. Os dados exibidos são
            da última resposta válida recebida da API.
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-green-500">
          <Wifi
            className="size-3.5"
            aria-hidden="true"
          />

          <p className="text-primary">
            API Online
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Atualizado {timeAgo(fetchedAt)}
          </span>

          <button
            type="button"
            onClick={() => void mutate()}
            disabled={isValidating}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3.5 ${isValidating
                  ? "animate-spin"
                  : ""
                }`}
              aria-hidden="true"
            />

            {isValidating
              ? "Atualizando..."
              : "Atualizar"}
          </button>
        </div>
      </div>

      <Tabs
        defaultValue="clube"
        className="w-full gap-6"
      >
        <TabsList className="h-auto w-full max-w-3xl bg-secondary p-1">
          <TabsTrigger
            value="clube"
            className="flex-1 gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield
              className="size-4"
              aria-hidden="true"
            />

            Clube
          </TabsTrigger>

          <TabsTrigger
            value="jogadores"
            className="flex-1 gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users
              className="size-4"
              aria-hidden="true"
            />

            Jogadores

            <span className="ml-1 rounded-full bg-background/40 px-1.5 text-xs">
              {members.length}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="destaques"
            className="flex-1 gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Sparkles
              className="size-4"
              aria-hidden="true"
            />

            Destaques
          </TabsTrigger>

          <TabsTrigger
            value="comparar"
            className="flex-1 gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <GitCompareArrows
              className="size-4"
              aria-hidden="true"
            />

            Comparar
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="clube"
          className="mt-0"
        >
          <ClubOverview
            club={club}
            recent={recent.club}
          />
        </TabsContent>

        <TabsContent
          value="jogadores"
          className="mt-0"
        >
          <PlayersSection
            members={members}
            recentPlayers={recent.players}
          />
        </TabsContent>

        <TabsContent
          value="destaques"
          className="mt-0"
        >
          <HighlightsSection
            highlights={recent.highlights}
          />
        </TabsContent>

        <TabsContent
          value="comparar"
          className="mt-0"
        >
          <CompareSection members={members} />
        </TabsContent>
      </Tabs>
    </div>
  )
}