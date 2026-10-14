import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmtData, fmtMoeda, getCliente, getViagem, type Documento } from "@/lib/mock-data";

export function DocViewer({ doc, onClose }: { doc: Documento | null; onClose: () => void }) {
  const v = doc ? getViagem(doc.viagemId) : undefined;
  const c = v ? getCliente(v.clienteId) : undefined;
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card">
        <DialogHeader><DialogTitle>{doc?.nome}</DialogTitle></DialogHeader>
        {doc && v && c && (
          doc.tipo === "XML" ? (
            <pre className="max-h-96 overflow-auto rounded-lg bg-background p-4 text-xs leading-relaxed text-info">{`<?xml version="1.0" encoding="UTF-8"?>
<cteProc versao="4.00">
  <CTe>
    <infCte Id="CTe3526${v.numero.replace("VG-", "")}000198570010000">
      <ide><nCT>${v.numero}</nCT><dhEmi>${v.data}</dhEmi></ide>
      <rem><xNome>${c.nome}</xNome><CNPJ>${c.cnpj}</CNPJ></rem>
      <origem>${v.origem}</origem><destino>${v.destino}</destino>
      <vPrest><vTPrest>${v.valor.toFixed(2)}</vTPrest></vPrest>
    </infCte>
  </CTe>
</cteProc>`}</pre>
          ) : doc.tipo === "ZIP" ? (
            <ul className="space-y-2 rounded-lg bg-background p-4 text-sm">
              {["cte.xml", "viagem.pdf", "fatura.pdf"].map((f) => <li key={f} className="flex justify-between"><span>📄 {v.numero}_{f}</span><span className="text-muted-foreground">compactado</span></li>)}
            </ul>
          ) : (
            <div className="rounded-lg bg-foreground p-8 text-background">
              <div className="flex justify-between border-b border-background/20 pb-4">
                <div><p className="text-xl font-bold">{doc.tipo === "PDF Fatura" ? "FATURA" : "ROMANEIO DE VIAGEM"}</p><p className="text-sm opacity-70">{v.numero}</p></div>
                <p className="text-sm opacity-70">{fmtData(v.data)}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><p className="opacity-60">Cliente</p><p className="font-semibold">{c.nome}</p></div>
                <div><p className="opacity-60">CNPJ</p><p className="font-semibold">{c.cnpj}</p></div>
                <div><p className="opacity-60">Rota</p><p className="font-semibold">{v.origem} → {v.destino}</p></div>
                <div><p className="opacity-60">Motorista / Placa</p><p className="font-semibold">{v.motorista} · {v.placa}</p></div>
              </div>
              <div className="mt-6 flex justify-between border-t border-background/20 pt-4 font-bold"><span>Valor total</span><span>{fmtMoeda(v.valor)}</span></div>
            </div>
          )
        )}
        <p className="text-xs text-muted-foreground">Visualização simulada — nenhum arquivo real é carregado.</p>
      </DialogContent>
    </Dialog>
  );
}
