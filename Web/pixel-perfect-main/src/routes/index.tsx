import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, FileText, Plane, Send, XCircle } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable, Panel, StatCard, StatusBadge, cellCls, rowCls } from "@/components/kit";
import { documentos, envios, eventos, fmtData, fmtDataHora, getCliente, viagens } from "@/lib/mock-data";
import { EventoIcon } from "@/components/evento-icon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Automação de Viagens" },
      { name: "description", content: "Visão geral do processamento de viagens, documentos e envios." },
      { property: "og:title", content: "Dashboard — Automação de Viagens" },
      { property: "og:description", content: "Visão geral do processamento de viagens, documentos e envios." },
    ],
  }),
  component: Dashboard,
});

const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" } };

function Dashboard() {
  const nav = useNavigate();
  const total = viagens.length;
  const proc = viagens.filter((v) => v.statusProc === "processada").length;
  const pend = viagens.filter((v) => v.statusProc === "pendente" || v.statusProc === "processando").length;
  const err = viagens.filter((v) => v.statusProc === "erro").length;
  const docs = documentos.filter((d) => d.status === "identificado").length;
  const env = envios.filter((e) => e.status === "enviado").length;

  const pie = [
    { name: "Processadas", value: proc, color: "var(--success)" },
    { name: "Pendentes", value: pend, color: "var(--warning)" },
    { name: "Com erro", value: err, color: "var(--destructive)" },
  ];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date("2026-10-07T12:00:00Z"); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const vs = viagens.filter((v) => v.data.slice(0, 10) === key);
    return { dia: d.toLocaleDateString("pt-BR", { weekday: "short" }), Processadas: vs.filter((v) => v.statusProc === "processada").length, Pendentes: vs.filter((v) => v.statusProc !== "processada").length };
  });

  return (
    <div className="space-y-6">
      <div className="panel flex items-center gap-5 p-6 sm:p-8">
        <span className="text-4xl">👋</span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Bem-vindo, Usuário!</h1>
          <p className="mt-1 text-muted-foreground">Acompanhe o fluxo Viagem → Documentos → Cliente → E-mail → Envio → Histórico.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Plane} tone="primary" label="Total de viagens" value={total} hint="Últimos 15 dias" />
        <StatCard icon={CheckCircle2} tone="success" label="Viagens processadas" value={proc} hint={`${Math.round((proc / total) * 100)}% do total`} />
        <StatCard icon={Clock} tone="warning" label="Pendentes" value={pend} hint="Aguardando tratamento" />
        <StatCard icon={XCircle} tone="destructive" label="Com erro" value={err} hint="Requerem atenção" />
        <StatCard icon={FileText} tone="doc" label="Documentos processados" value={docs} hint="XML, PDFs e ZIPs" />
        <StatCard icon={Send} tone="info" label="Envios realizados" value={env} hint={`${envios.filter((e) => e.status === "erro").length} com falha`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Andamento dos processos" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={days}>
                <XAxis dataKey="dia" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="Processadas" stackId="a" fill="var(--primary)" />
                <Bar dataKey="Pendentes" stackId="a" fill="var(--warning)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Status das viagens">
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {pie.map((p) => (
              <li key={p.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.name}</span>
                <span className="font-semibold">{p.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Últimas viagens" className="xl:col-span-2" action={<Link to="/viagens" className="flex items-center text-sm text-primary">Ver todas <ChevronRight className="h-4 w-4" /></Link>}>
          <DataTable head={["Viagem", "Data", "Cliente", "Processamento", "Envio"]}>
            {viagens.slice(0, 6).map((v) => (
              <tr key={v.id} className={rowCls} onClick={() => nav({ to: "/viagens/$id", params: { id: v.id } })}>
                <td className={`${cellCls} font-semibold`}>{v.numero}</td>
                <td className={cellCls}>{fmtData(v.data)}</td>
                <td className={`${cellCls} max-w-48 truncate`}>{getCliente(v.clienteId).nome}</td>
                <td className={cellCls}><StatusBadge status={v.statusProc} /></td>
                <td className={cellCls}><StatusBadge status={v.statusEnvio} /></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
        <Panel title="Atividades recentes" action={<Link to="/historico" className="flex items-center text-sm text-primary">Histórico <ChevronRight className="h-4 w-4" /></Link>}>
          <ul className="space-y-4">
            {eventos.slice(0, 7).map((e) => (
              <li key={e.id} className="flex gap-3">
                <EventoIcon tipo={e.tipo} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{e.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.descricao}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtDataHora(e.data)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      {err > 0 && (
        <Link to="/viagens" search={{ status: "erro" }} className="panel flex items-center gap-3 border-destructive/40 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 text-destructive" /> {err} viagens com erro aguardam revisão. <span className="ml-auto text-primary">Revisar</span>
        </Link>
      )}
    </div>
  );
}
