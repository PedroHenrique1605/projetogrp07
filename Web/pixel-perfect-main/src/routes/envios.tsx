import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, Field, PageHeader, Panel, StatCard, StatusBadge, btnPrimary, cellCls, inputCls, rowCls } from "@/components/kit";
import { documentos, envios, fmtDataHora, getCliente, getViagem, type EnvioEmail } from "@/lib/mock-data";

export const Route = createFileRoute("/envios")({
  head: () => ({
    meta: [
      { title: "Envios — Automação de Viagens" },
      { name: "description", content: "Acompanhe os envios de documentos por e-mail aos clientes." },
      { property: "og:title", content: "Envios — Automação de Viagens" },
      { property: "og:description", content: "Acompanhe os envios de documentos por e-mail aos clientes." },
    ],
  }),
  component: Envios,
});

function Envios() {
  const [q, setQ] = useState(""); const [st, setSt] = useState("todos");
  const [sel, setSel] = useState<EnvioEmail | null>(null);
  const list = envios.filter((e) => (st === "todos" || e.status === st) &&
    `${e.destinatario} ${getCliente(e.clienteId).nome} ${getViagem(e.viagemId)!.numero}`.toLowerCase().includes(q.toLowerCase()));
  const v = sel ? getViagem(sel.viagemId)! : null;
  return (
    <div>
      <PageHeader title="Envios" subtitle="Documentos encaminhados aos clientes por e-mail." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} tone="success" label="Concluídos" value={envios.filter((e) => e.status === "enviado").length} />
        <StatCard icon={Clock} tone="info" label="Na fila" value={envios.filter((e) => e.status === "aguardando").length} />
        <StatCard icon={XCircle} tone="destructive" label="Com falha" value={envios.filter((e) => e.status === "erro").length} />
      </div>
      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input className={`${inputCls} pl-9`} placeholder="Buscar destinatário, cliente ou viagem..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className={inputCls} value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="todos">Status: todos</option><option value="enviado">Enviado</option><option value="aguardando">Aguardando</option><option value="erro">Erro</option>
          </select>
        </div>
        <DataTable head={["Viagem", "Cliente", "Destinatário", "Data", "Tentativas", "Status"]}>
          {list.map((e) => (
            <tr key={e.id} className={rowCls} onClick={() => setSel(e)}>
              <td className={`${cellCls} font-semibold text-primary`}>{getViagem(e.viagemId)!.numero}</td>
              <td className={`${cellCls} max-w-48 truncate`}>{getCliente(e.clienteId).nome}</td>
              <td className={cellCls}>{e.destinatario}</td>
              <td className={cellCls}>{fmtDataHora(e.data)}</td>
              <td className={cellCls}>{e.tentativas}</td>
              <td className={cellCls}><StatusBadge status={e.status} /></td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-xl border-border bg-card">
          <DialogHeader><DialogTitle>Detalhes do envio</DialogTitle></DialogHeader>
          {sel && v && (
            <div className="space-y-5">
              <div className="flex items-center justify-between"><p className="font-medium">{sel.assunto}</p><StatusBadge status={sel.status} /></div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Destinatário" value={sel.destinatario} />
                <Field label="Cópia" value={getCliente(sel.clienteId).emailsCopia.join(", ")} />
                <Field label="Cliente" value={getCliente(sel.clienteId).nome} />
                <Field label="Data" value={fmtDataHora(sel.data)} />
              </div>
              <div><p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Anexos</p>
                <div className="flex flex-wrap gap-2">{documentos.filter((d) => d.viagemId === v.id && d.tipo !== "ZIP").map((d) => <span key={d.id} className="rounded-md bg-secondary px-2 py-1 text-xs">{d.nome}</span>)}</div></div>
              <div className={`rounded-lg p-3 text-sm ${sel.status === "erro" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>Resposta do servidor: {sel.mensagem}</div>
              <div className="flex justify-between">
                <Link to="/viagens/$id" params={{ id: v.id }} className="text-sm text-primary">Abrir viagem {v.numero}</Link>
                {sel.status === "erro" && <button className={btnPrimary} onClick={() => { toast.success("Reenvio simulado agendado"); setSel(null); }}>Tentar novamente</button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
