import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Mail, Search } from "lucide-react";
import { useState } from "react";
import { PageHeader, inputCls } from "@/components/kit";
import { clientes, viagens } from "@/lib/mock-data";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes — Automação de Viagens" },
      { name: "description", content: "Clientes relacionados às viagens, seus e-mails e operações." },
      { property: "og:title", content: "Clientes — Automação de Viagens" },
      { property: "og:description", content: "Clientes relacionados às viagens, seus e-mails e operações." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const [q, setQ] = useState("");
  const list = clientes.filter((c) => `${c.nome} ${c.cnpj} ${c.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Clientes" subtitle="Clientes identificados nas viagens e seus contatos de envio." />
      <div className="relative mb-6 max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input className={`${inputCls} pl-9`} placeholder="Buscar cliente, CNPJ ou e-mail..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((c) => {
          const vs = viagens.filter((v) => v.clienteId === c.id);
          return (
            <Link key={c.id} to="/clientes/$id" params={{ id: c.id }} className="panel flex items-center gap-4 p-5 transition hover:border-primary/60">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange text-lg font-bold text-on-color">{c.nome.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.nome}</p>
                <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{c.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.cidade} · {vs.length} viagens · {vs.filter((v) => v.statusEnvio === "erro" || v.statusProc === "erro").length} com erro</p>
              </div>
              {!c.ativo && <span className="rounded-full bg-warning/15 px-2 py-1 text-xs text-warning">Inativo</span>}
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
