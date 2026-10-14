import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, PageHeader, Panel, StatusBadge, btnGhost, cellCls, inputCls, rowCls } from "@/components/kit";
import { clientes, documentos, fmtData, getCliente, viagens } from "@/lib/mock-data";

type Search = { status?: string | undefined };

export const Route = createFileRoute("/viagens/")({
  validateSearch: (s: Record<string, unknown>): Search => ({ status: typeof s["status"] === "string" ? s["status"] : undefined }),
  head: () => ({
    meta: [
      { title: "Viagens — Automação de Viagens" },
      { name: "description", content: "Lista de viagens com status de processamento e envio." },
      { property: "og:title", content: "Viagens — Automação de Viagens" },
      { property: "og:description", content: "Lista de viagens com status de processamento e envio." },
    ],
  }),
  component: Viagens,
});

function Viagens() {
  const nav = useNavigate();
  const { status: initial } = Route.useSearch();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(initial ?? "todos");
  const [envio, setEnvio] = useState("todos");
  const [cli, setCli] = useState("todos");

  const list = viagens.filter((v) =>
    (status === "todos" || v.statusProc === status) && (envio === "todos" || v.statusEnvio === envio) &&
    (cli === "todos" || v.clienteId === cli) &&
    (`${v.numero} ${getCliente(v.clienteId).nome} ${v.origem} ${v.destino}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <PageHeader title="Viagens" subtitle="Gerencie as viagens e acompanhe o tratamento dos documentos."
        actions={<button className={btnGhost} onClick={() => toast.success("Exportação simulada gerada (CSV)")}><Download className="h-4 w-4" />Exportar</button>} />
      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(3,180px)]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input className={`${inputCls} pl-9`} placeholder="Buscar por número, cliente ou cidade..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Processamento: todos</option><option value="processada">Processada</option>
            <option value="processando">Processando</option><option value="pendente">Pendente</option><option value="erro">Erro</option>
          </select>
          <select className={inputCls} value={envio} onChange={(e) => setEnvio(e.target.value)}>
            <option value="todos">Envio: todos</option><option value="enviado">Enviado</option>
            <option value="aguardando">Aguardando</option><option value="pendente">Pendente</option><option value="erro">Erro</option>
          </select>
          <select className={inputCls} value={cli} onChange={(e) => setCli(e.target.value)}>
            <option value="todos">Cliente: todos</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <DataTable head={["Viagem", "Data", "Cliente", "Rota", "Docs", "Processamento", "Envio"]}>
          {list.map((v) => (
            <tr key={v.id} className={rowCls} onClick={() => nav({ to: "/viagens/$id", params: { id: v.id } })}>
              <td className={`${cellCls} font-semibold text-primary`}>{v.numero}</td>
              <td className={cellCls}>{fmtData(v.data)}</td>
              <td className={`${cellCls} max-w-52 truncate`}>{getCliente(v.clienteId).nome}</td>
              <td className={`${cellCls} whitespace-nowrap text-muted-foreground`}>{v.origem} → {v.destino}</td>
              <td className={cellCls}>{documentos.filter((d) => d.viagemId === v.id).length}</td>
              <td className={cellCls}><StatusBadge status={v.statusProc} /></td>
              <td className={cellCls}><StatusBadge status={v.statusEnvio} /></td>
            </tr>
          ))}
        </DataTable>
        {list.length === 0 && <p className="py-10 text-center text-muted-foreground">Nenhuma viagem encontrada.</p>}
        <p className="mt-4 text-xs text-muted-foreground">{list.length} de {viagens.length} viagens</p>
      </Panel>
    </div>
  );
}
