import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/kit";
import { EventoIcon } from "@/components/evento-icon";
import { cn } from "@/lib/utils";
import { eventos, fmtData, fmtDataHora, getViagem, type Evento } from "@/lib/mock-data";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — Automação de Viagens" },
      { name: "description", content: "Linha do tempo de todas as operações realizadas pelo sistema." },
      { property: "og:title", content: "Histórico — Automação de Viagens" },
      { property: "og:description", content: "Linha do tempo de todas as operações realizadas pelo sistema." },
    ],
  }),
  component: Historico,
});

const filtros: { k: "todos" | Evento["tipo"]; l: string }[] = [
  { k: "todos", l: "Todos" }, { k: "processada", l: "Processadas" }, { k: "documentos", l: "Documentos" },
  { k: "cliente", l: "Clientes" }, { k: "envio", l: "Envios" }, { k: "erro", l: "Erros" },
];

function Historico() {
  const [f, setF] = useState<(typeof filtros)[number]["k"]>("todos");
  const list = eventos.filter((e) => f === "todos" || e.tipo === f);
  const groups = list.reduce<Record<string, Evento[]>>((acc, e) => { (acc[fmtData(e.data)] ??= []).push(e); return acc; }, {});
  return (
    <div>
      <PageHeader title="Histórico" subtitle="Linha do tempo das operações de processamento e envio." />
      <div className="mb-6 flex flex-wrap gap-2">
        {filtros.map((x) => (
          <button key={x.k} onClick={() => setF(x.k)} className={cn("rounded-full border px-4 py-1.5 text-sm transition", f === x.k ? "border-info bg-info/15 text-info" : "border-border hover:bg-secondary")}>{x.l}</button>
        ))}
      </div>
      <div className="space-y-6">
        {Object.entries(groups).map(([dia, evs]) => (
          <Panel key={dia} title={dia}>
            <ol className="relative ml-4 border-l border-border">
              {evs.map((e) => (
                <li key={e.id} className="relative mb-5 ml-8 last:mb-0">
                  <span className="absolute -left-[3.25rem] top-0"><EventoIcon tipo={e.tipo} /></span>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className={cn("font-medium", e.tipo === "erro" && "text-destructive")}>{e.titulo}</p>
                    <span className="text-xs text-muted-foreground">{fmtDataHora(e.data)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.descricao}</p>
                  <Link to="/viagens/$id" params={{ id: e.viagemId }} className="text-xs text-primary">{getViagem(e.viagemId)?.numero}</Link>
                </li>
              ))}
            </ol>
          </Panel>
        ))}
      </div>
    </div>
  );
}
