import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, Eye, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocViewer } from "@/components/doc-viewer";
import { Field, PageHeader, Panel, StatusBadge, btnGhost, btnPrimary } from "@/components/kit";
import { cn } from "@/lib/utils";
import { ETAPAS, documentos, envios, fmtDataHora, fmtMoeda, getCliente, getViagem, stepState, type Documento } from "@/lib/mock-data";

export const Route = createFileRoute("/viagens/$id")({
  loader: ({ params }) => { const v = getViagem(params.id); if (!v) throw notFound(); return { numero: v.numero }; },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Viagem ${loaderData.numero} — Automação de Viagens` : "Viagem não encontrada" },
      { name: "description", content: "Detalhes da viagem e fluxo de processamento dos documentos." },
      { property: "og:title", content: loaderData ? `Viagem ${loaderData.numero}` : "Viagem" },
      { property: "og:description", content: "Detalhes da viagem e fluxo de processamento dos documentos." },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Viagem não encontrada. <Link to="/viagens" className="text-primary">Voltar</Link></p>,
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const v = getViagem(id)!;
  const c = getCliente(v.clienteId);
  const docs = documentos.filter((d) => d.viagemId === v.id);
  const env = envios.filter((e) => e.viagemId === v.id);
  const [doc, setDoc] = useState<Documento | null>(null);

  return (
    <div className="space-y-6">
      <Link to="/viagens" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Viagens</Link>
      <PageHeader title={`Viagem ${v.numero}`} subtitle={`${v.origem} → ${v.destino}`}
        actions={<>
          <button className={btnGhost} onClick={() => toast.info("Reprocessamento simulado iniciado")}><RefreshCw className="h-4 w-4" />Reprocessar</button>
          <button className={btnPrimary} onClick={() => toast.success(`Documentos reenviados para ${c.email} (simulado)`)}>Reenviar documentos</button>
        </>} />

      {v.erro && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" /><div><p className="font-semibold text-destructive">Erro na etapa "{ETAPAS[v.etapa]}"</p><p className="text-muted-foreground">{v.erro}</p></div>
        </div>
      )}

      <Panel title="Informações da viagem">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <Field label="Número" value={v.numero} />
          <Field label="Data" value={fmtDataHora(v.data)} />
          <Field label="Cliente" value={<Link to="/clientes/$id" params={{ id: c.id }} className="text-primary">{c.nome}</Link>} />
          <Field label="E-mail destino" value={c.email} />
          <Field label="Motorista" value={v.motorista} />
          <Field label="Placa" value={v.placa} />
          <Field label="Valor do frete" value={fmtMoeda(v.valor)} />
          <div className="flex gap-2"><StatusBadge status={v.statusProc} /><StatusBadge status={v.statusEnvio} /></div>
        </div>
      </Panel>

      <Panel title="Fluxo de processamento">
        <ol className="relative grid gap-0 md:grid-cols-9">
          {ETAPAS.map((e, i) => {
            const s = stepState(v, i);
            return (
              <li key={e} className="relative flex gap-3 pb-6 md:flex-col md:items-center md:pb-0 md:text-center">
                {i < ETAPAS.length - 1 && <span className={cn("absolute left-5 top-10 h-full w-0.5 md:left-1/2 md:top-5 md:h-0.5 md:w-full", s === "concluida" ? "bg-success" : "bg-border")} />}
                <span className={cn("relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-sm font-bold",
                  s === "concluida" && "border-success bg-success text-on-color", s === "erro" && "border-destructive bg-destructive text-on-color",
                  s === "atual" && "border-primary bg-primary/20 text-primary", s === "pendente" && "border-border bg-card text-muted-foreground")}>
                  {s === "concluida" ? <Check className="h-5 w-5" /> : s === "erro" ? "!" : s === "atual" ? <Loader2 className="h-5 w-5 animate-spin" /> : i + 1}
                </span>
                <div className="md:mt-3 md:px-1">
                  <p className="text-sm font-medium leading-tight">{e}</p>
                  <p className={cn("text-xs", s === "erro" ? "text-destructive" : "text-muted-foreground")}>{{ concluida: "Concluída", erro: "Falhou", atual: "Em andamento", pendente: "Pendente" }[s]}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Documentos">
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{d.nome}</p><p className="text-xs text-muted-foreground">{d.tipo} · {d.tamanho}</p></div>
                <div className="flex shrink-0 items-center gap-2"><StatusBadge status={d.status} />
                  <button onClick={() => setDoc(d)} className="rounded-lg p-2 hover:bg-secondary" aria-label="Visualizar"><Eye className="h-4 w-4" /></button></div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Envios de e-mail">
          {env.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum envio realizado para esta viagem ainda.</p> : (
            <ul className="space-y-3">
              {env.map((e) => (
                <li key={e.id} className="rounded-lg bg-secondary/50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2"><p className="font-medium">{e.destinatario}</p><StatusBadge status={e.status} /></div>
                  <p className="mt-1 text-muted-foreground">{e.assunto}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{fmtDataHora(e.data)} · {e.tentativas} tentativa(s) · {e.mensagem}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <DocViewer doc={doc} onClose={() => setDoc(null)} />
    </div>
  );
}
