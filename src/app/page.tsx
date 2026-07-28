import { Activity } from "lucide-react"
import { Dashboard } from "@/src/components/dashboard"
import {
  CLUB_ID,
  CLUB_NAME,
  PLATFORM,
} from "@/src/services/ea"

export default function Page() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
          <Activity
            className="size-4"
            aria-hidden="true"
          />

          EA FC Pro Clubs
        </div>

        <h1 className="text-balance text-3xl font-bold capitalize text-foreground sm:text-4xl">
          {CLUB_NAME}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Estatísticas do clube e desempenho individual do elenco.
        </p>
      </header>

      <Dashboard />

      <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Fonte: proclubs.ea.com · Plataforma {PLATFORM} · Clube{" "}
        {CLUB_ID}
      </footer>
    </main>
  )
}