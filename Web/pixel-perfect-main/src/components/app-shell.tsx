import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Box, ChevronDown, Clock, FileText, HelpCircle, Home, Menu, Plane, Settings, UploadCloud, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventos, fmtDataHora } from "@/lib/mock-data";

export const NAV = [
  { to: "/", label: "Dashboard", icon: Home, color: "text-primary" },
  { to: "/viagens", label: "Viagens", icon: Plane, color: "text-destructive" },
  { to: "/documentos", label: "Documentos", icon: FileText, color: "text-doc" },
  { to: "/envios", label: "Envios", icon: UploadCloud, color: "text-success" },
  { to: "/clientes", label: "Clientes", icon: Users, color: "text-orange" },
  { to: "/historico", label: "Histórico", icon: Clock, color: "text-info" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, color: "text-muted-foreground" },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-col gap-1 p-4">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} onClick={onNavigate}
            className={cn("flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors",
              active(n.to) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-secondary/60")}>
            <n.icon className={cn("h-5 w-5", n.color)} />{n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Link to="/ajuda" onClick={onNavigate} className="flex gap-3 border-t border-sidebar-border px-2 pt-6 hover:opacity-90">
          <HelpCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div><p className="text-sm font-medium">Ajuda e Suporte</p><p className="text-xs text-muted-foreground">Dúvidas? Estamos aqui para ajudar.</p></div>
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState(false);
  const [notif, setNotif] = useState(false);
  const [user, setUser] = useState(false);
  const alerts = eventos.filter((e) => e.tipo === "erro").slice(0, 3);
  return (
    <div className="min-h-screen">
      <header className="bg-header sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button className="md:hidden" onClick={() => setMobile(true)} aria-label="Abrir menu"><Menu className="h-6 w-6" /></button>
          <Box className="h-8 w-8 shrink-0 text-primary" />
          <span className="truncate font-bold uppercase tracking-wide">Automação de Viagens</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="relative">
            <button onClick={() => { setNotif(!notif); setUser(false); }} className="relative rounded-lg p-2 hover:bg-secondary" aria-label="Notificações">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">{alerts.length}</span>
            </button>
            {notif && (
              <div className="panel absolute right-0 mt-2 w-80 p-2">
                <p className="px-3 py-2 text-sm font-semibold">Notificações</p>
                {alerts.map((a) => (
                  <Link key={a.id} to="/viagens/$id" params={{ id: a.viagemId }} onClick={() => setNotif(false)} className="block rounded-lg px-3 py-2 hover:bg-secondary">
                    <p className="text-sm font-medium text-destructive">{a.titulo}</p>
                    <p className="text-xs text-muted-foreground">{a.descricao}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{fmtDataHora(a.data)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative border-l pl-3 sm:pl-4">
            <button onClick={() => { setUser(!user); setNotif(false); }} className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold">US</span>
              <span className="hidden sm:inline">Usuário</span><ChevronDown className="h-4 w-4" />
            </button>
            {user && (
              <div className="panel absolute right-0 mt-2 w-48 p-2 text-sm">
                <Link to="/configuracoes" onClick={() => setUser(false)} className="block rounded-lg px-3 py-2 hover:bg-secondary">Configurações</Link>
                <Link to="/ajuda" onClick={() => setUser(false)} className="block rounded-lg px-3 py-2 hover:bg-secondary">Ajuda</Link>
                <button onClick={() => setUser(false)} className="block w-full rounded-lg px-3 py-2 text-left text-muted-foreground hover:bg-secondary">Sair (simulado)</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 border-r bg-sidebar md:block"><SidebarNav /></aside>
        {mobile && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-background/80" onClick={() => setMobile(false)} />
            <aside className="relative h-full w-72 bg-sidebar">
              <button className="absolute right-3 top-3" onClick={() => setMobile(false)} aria-label="Fechar"><X className="h-5 w-5" /></button>
              <div className="pt-8"><SidebarNav onNavigate={() => setMobile(false)} /></div>
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
