import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DataTable, Field, PageHeader, Panel, StatusBadge, cellCls, rowCls } from "@/components/kit";
import { EventoIcon } from "@/components/evento-icon";
import { clientes, documentos, envios, eventos, fmtData, fmtDataHora, getCliente, viagens } from "@/lib/mock-data";

export const Route = createFileRoute("/clientes/$id")({
  loader: ({ params }) => { const c = clientes.find((c) => c.id === params.id); if (!c) throw notFound(); return { nome: c.nome }; },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.nome} — Clientes` : "Cliente não encontrado" },
      { name: "description", content: "Informações do cliente, viagens relacionadas e histórico de envios." },
      { property: "og:title", content: loaderData ? loaderData.nome : "Cliente" },
      { property: "og:description", content: "Informações do cliente, viagens relacionadas e histórico de envios." },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Cliente não encontrado. <Link to="/clientes" className="text-primary">Voltar</Link></p>,
  component: Cliente,
});

function Cliente() {
  const nav = useNavigate();
  const { id } = Route.useParams();
  const c = getCliente(id);
  const vs = viagens.filter((v) => v.clienteId === id);
  const ids = new Set(vs.map((v) => v.id));
  const evs = eventos.filter((e) => ids.has(e.viagemId)).slice(0, 8);
  return (
    <div className="space-y-6">
      <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Clientes</Link>
      <PageHeader title={c.nome} subtitle={`CNPJ ${c.cnpj}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Dados do cliente" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            <Field label="E-mail principal" value={c.email} />
            <Field label="Cópia" value={c.emailsCopia.join(", ")} />
            <Field label="Contato" value={c.contato} />
            <Field label="Telefone" value={c.telefone} />
            <Field label="Cidade" value={c.cidade} />
            <Field label="Situação" value={c.ativo ? "Ativo" : "Inativo"} />
          </div>
        </Panel>
        <Panel title="Resumo">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold">{vs.length}</p><p className="text-xs text-muted-foreground">Viagens</p></div>
            <div><p className="text-2xl font-bold text-doc">{documentos.filter((d) => ids.has(d.viagemId)).length}</p><p className="text-xs text-muted-foreground">Documentos</p></div>
            <div><p className="text-2xl font-bold text-success">{envios.filter((e) => e.clienteId === id && e.status === "enviado").length}</p><p className="text-xs text-muted-foreground">Envios</p></div>
          </div>
        </Panel>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Viagens relacionadas" className="xl:col-span-2">
          <DataTable head={["Viagem", "Data", "Rota", "Processamento", "Envio"]}>
            {vs.map((v) => (
              <tr key={v.id} className={rowCls} onClick={() => nav({ to: "/viagens/$id", params: { id: v.id } })}>
                <td className={`${cellCls} font-semibold text-primary`}>{v.numero}</td>
                <td className={cellCls}>{fmtData(v.data)}</td>
                <td className={`${cellCls} whitespace-nowrap text-muted-foreground`}>{v.origem} → {v.destino}</td>
                <td className={cellCls}><StatusBadge status={v.statusProc} /></td>
                <td className={cellCls}><StatusBadge status={v.statusEnvio} /></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
        <Panel title="Histórico de operações">
          {evs.length === 0 ? <p className="text-sm text-muted-foreground">Sem operações recentes.</p> : (
            <ul className="space-y-4">{evs.map((e) => (
              <li key={e.id} className="flex gap-3"><EventoIcon tipo={e.tipo} />
                <div className="min-w-0"><p className="text-sm font-medium">{e.titulo}</p><p className="text-[11px] text-muted-foreground">{fmtDataHora(e.data)}</p></div></li>
            ))}</ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
