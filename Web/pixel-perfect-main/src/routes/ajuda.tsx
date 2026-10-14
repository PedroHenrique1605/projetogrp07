import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader, Panel, btnPrimary, inputCls } from "@/components/kit";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda e Suporte — Automação de Viagens" },
      { name: "description", content: "Perguntas frequentes e contato com o suporte." },
      { property: "og:title", content: "Ajuda e Suporte — Automação de Viagens" },
      { property: "og:description", content: "Perguntas frequentes e contato com o suporte." },
    ],
  }),
  component: Ajuda,
});

const faq: [string, string][] = [
  ["Como funciona o fluxo de automação?", "Viagem → Documentos → Cliente → E-mail → Envio → Histórico. Após a geração da viagem, o sistema localiza o ZIP, organiza XML e PDFs, identifica o cliente e o e-mail e envia os documentos."],
  ["O que fazer quando uma viagem apresenta erro?", "Abra a viagem, veja em qual etapa o fluxo parou e use “Reprocessar” após corrigir a causa (ex.: e-mail não cadastrado)."],
  ["Como reenviar documentos?", "Na página da viagem ou em Envios, abra o detalhe e clique em “Tentar novamente”."],
  ["Onde altero a pasta dos arquivos ZIP?", "Em Configurações → Localização dos arquivos."],
];

function Ajuda() {
  return (
    <div>
      <PageHeader title="Ajuda e Suporte" subtitle="Dúvidas? Estamos aqui para ajudar." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Perguntas frequentes">
          <Accordion type="single" collapsible>
            {faq.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
          </Accordion>
        </Panel>
        <Panel title="Fale com o suporte">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Chamado aberto (simulado)"); (e.target as HTMLFormElement).reset(); }}>
            <input className={inputCls} placeholder="Assunto" required />
            <textarea className={`${inputCls} h-32 py-2`} placeholder="Descreva sua dúvida..." required />
            <button className={btnPrimary}>Enviar chamado</button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
