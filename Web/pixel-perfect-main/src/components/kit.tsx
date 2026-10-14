import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusDoc, StatusEnvio, StatusProc } from "@/lib/mock-data";

export const tones = {
  primary: "bg-primary", success: "bg-success", destructive: "bg-destructive", warning: "bg-warning",
  info: "bg-info", doc: "bg-doc", orange: "bg-orange", slate: "bg-slate",
} as const;
export type Tone = keyof typeof tones;

export function IconTile({ icon: Icon, tone, size = "md" }: { icon: LucideIcon; tone: Tone; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-16 w-16 rounded-2xl" : size === "sm" ? "h-9 w-9 rounded-lg" : "h-12 w-12 rounded-xl";
  const i = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return <div className={cn("grid shrink-0 place-items-center text-on-color", s, tones[tone])}><Icon className={i} /></div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("panel p-5", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">{title}</h2>{action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ icon, tone, label, value, hint }: { icon: LucideIcon; tone: Tone; label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="panel flex items-center gap-4 p-5">
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  processada: "bg-success/15 text-success", enviado: "bg-success/15 text-success", identificado: "bg-success/15 text-success",
  processando: "bg-primary/15 text-primary", aguardando: "bg-info/15 text-info",
  pendente: "bg-warning/15 text-warning", erro: "bg-destructive/15 text-destructive",
};
const labels: Record<string, string> = {
  processada: "Processada", enviado: "Enviado", identificado: "Identificado", processando: "Processando",
  aguardando: "Aguardando", pendente: "Pendente", erro: "Erro",
};
export function StatusBadge({ status }: { status: StatusProc | StatusEnvio | StatusDoc }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", badgeStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />{labels[status]}
    </span>
  );
}

export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            {head.map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
export const rowCls = "cursor-pointer transition-colors hover:bg-secondary/60";
export const cellCls = "px-3 py-3";

export const inputCls = "h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary";
export const btnPrimary = "inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90";
export const btnGhost = "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 text-sm font-medium transition hover:bg-secondary";

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}
