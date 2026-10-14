import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, FileArchive, FileCode, FileText, Receipt, Search } from "lucide-react";
import { useState } from "react";
import { DocViewer } from "@/components/doc-viewer";
import { DataTable, IconTile, PageHeader, Panel, StatusBadge, cellCls, inputCls } from "@/components/kit";
import { documentos, fmtData, getCliente, getViagem, type Documento, type TipoDoc } from "@/lib/mock-data";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — Automação de Viagens" },
      { name: "description", content: "XML, PDFs de viagem e fatura e pacotes ZIP identificados." },
      { property: "og:title", content: "Documentos — Automação de Viagens" },
      { property: "og:description", content: "XML, PDFs de viagem e fatura e pacotes ZIP identificados." },
    ],
  }),
  component: Documentos,
});

const tipoIcon = { ZIP: { icon: FileArchive, tone: "primary" }, XML: { icon: FileCode, tone: "info" }, "PDF Viagem": { icon: FileText, tone: "doc" }, "PDF Fatura": { icon: Receipt, tone: "orange" } } as const;

function Documentos() {
  const [q, setQ] = useState(""); const [tipo, setTipo] = useState("todos"); const [st, setSt] = useState("todos");
  const [doc, setDoc] = useState<Documento | null>(null);
  const list = documentos.filter((d) => {
    const v = getViagem(d.viagemId)!;
    return (tipo === "todos" || d.tipo === tipo) && (st === "todos" || d.status === st) &&
      `${d.nome} ${getCliente(v.clienteId).nome}`.toLowerCase().includes(q.toLowerCase());
  });
  return (
    <div>
      <PageHeader title="Documentos" subtitle="Arquivos extraídos e organizados a partir dos pacotes das viagens." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(tipoIcon) as TipoDoc[]).map((t) => (
          <button key={t} onClick={() => setTipo(tipo === t ? "todos" : t)} className={`panel flex items-center gap-4 p-4 text-left transition ${tipo === t ? "border-primary" : ""}`}>
            <IconTile icon={tipoIcon[t].icon} tone={tipoIcon[t].tone} />
            <div><p className="text-sm text-muted-foreground">{t}</p><p className="text-xl font-bold">{documentos.filter((d) => d.tipo === t).length}</p></div>
          </button>
        ))}
      </div>
      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input className={`${inputCls} pl-9`} placeholder="Buscar arquivo ou cliente..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="todos">Tipo: todos</option>{Object.keys(tipoIcon).map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={inputCls} value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="todos">Status: todos</option><option value="identificado">Identificado</option><option value="pendente">Pendente</option><option value="erro">Erro</option>
          </select>
        </div>
        <DataTable head={["Arquivo", "Tipo", "Viagem", "Cliente", "Data", "Status", ""]}>
          {list.slice(0, 60).map((d) => {
            const v = getViagem(d.viagemId)!;
            return (
              <tr key={d.id} className="hover:bg-secondary/60">
                <td className={`${cellCls} font-medium`}>{d.nome}</td>
                <td className={cellCls}>{d.tipo}</td>
                <td className={cellCls}><Link to="/viagens/$id" params={{ id: v.id }} className="text-primary">{v.numero}</Link></td>
                <td className={`${cellCls} max-w-48 truncate`}>{getCliente(v.clienteId).nome}</td>
                <td className={cellCls}>{fmtData(d.data)}</td>
                <td className={cellCls}><StatusBadge status={d.status} /></td>
                <td className={cellCls}><button onClick={() => setDoc(d)} className="rounded-lg p-2 hover:bg-secondary" aria-label="Visualizar"><Eye className="h-4 w-4" /></button></td>
              </tr>
            );
          })}
        </DataTable>
        <p className="mt-4 text-xs text-muted-foreground">Exibindo {Math.min(list.length, 60)} de {list.length} documentos</p>
      </Panel>
      <DocViewer doc={doc} onClose={() => setDoc(null)} />
    </div>
  );
}
