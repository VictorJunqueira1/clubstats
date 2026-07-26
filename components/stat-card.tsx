import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon?: LucideIcon
  label: string
  value: string | number
  hint?: string
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-card-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  )
}
