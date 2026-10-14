import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel, btnGhost, btnPrimary, inputCls } from "@/components/kit";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Automação de Viagens" },
      { name: "description", content: "Preferências de processamento, pastas e envio de e-mails." },
      { property: "og:title", content: "Configurações — Automação de Viagens" },
      { property: "og:description", content: "Preferências de processamento, pastas e envio de e-mails." },
    ],
  }),
  component: Config,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center">
      <div><p className="text-sm font-medium">{label}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
      <div>{children}</div>
    </div>
  );
}

function Config() {
  const [sw, setSw] = useState({ auto: true, reenvio: true, copia: false, notif: true, resumo: true });
  const t = (k: keyof typeof sw) => <Switch checked={sw[k]} onCheckedChange={(v) => setSw({ ...sw, [k]: v })} />;
  return (
    <div>
      <PageHeader title="Configurações" subtitle="Ajuste o comportamento da automação (valores simulados)."
        actions={<><button className={btnGhost} onClick={() => toast("Alterações descartadas")}>Cancelar</button><button className={btnPrimary} onClick={() => toast.success("Configurações salvas (simulado)")}>Salvar</button></>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Localização dos arquivos">
          <div className="divide-y divide-border">
            <Row label="Pasta de origem dos ZIPs" hint="Onde as viagens geradas são depositadas"><input className={inputCls} defaultValue="\\\\servidor\\viagens\\saida" /></Row>
            <Row label="Pasta de documentos organizados"><input className={inputCls} defaultValue="\\\\servidor\\viagens\\organizados" /></Row>
            <Row label="Intervalo de verificação"><select className={inputCls} defaultValue="5"><option value="1">A cada 1 minuto</option><option value="5">A cada 5 minutos</option><option value="15">A cada 15 minutos</option></select></Row>
            <Row label="Processamento automático" hint="Iniciar assim que um ZIP for localizado">{t("auto")}</Row>
          </div>
        </Panel>
        <Panel title="Envio de e-mails">
          <div className="divide-y divide-border">
            <Row label="Remetente"><input className={inputCls} defaultValue="documentos@transportadora.com.br" /></Row>
            <Row label="Modelo de assunto"><input className={inputCls} defaultValue="Documentos da viagem {numero}" /></Row>
            <Row label="Reenvio automático em caso de falha" hint="Até 3 tentativas">{t("reenvio")}</Row>
            <Row label="Enviar cópia para a equipe interna">{t("copia")}</Row>
          </div>
        </Panel>
        <Panel title="Identificação de documentos">
          <div className="divide-y divide-border">
            <Row label="Padrão do XML"><select className={inputCls}><option>CT-e 4.00</option><option>NF-e 4.00</option></select></Row>
            <Row label="Identificar cliente por"><select className={inputCls}><option>CNPJ do remetente (XML)</option><option>Nome do arquivo</option></select></Row>
          </div>
        </Panel>
        <Panel title="Notificações">
          <div className="divide-y divide-border">
            <Row label="Alertar sobre erros">{t("notif")}</Row>
            <Row label="Resumo diário por e-mail">{t("resumo")}</Row>
          </div>
        </Panel>
      </div>
    </div>
  );
}
