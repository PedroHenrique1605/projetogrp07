import { AlertTriangle, CheckCircle2, FileText, Package, Send, User } from "lucide-react";
import { IconTile } from "@/components/kit";
import type { Evento } from "@/lib/mock-data";

const map = {
  zip: { icon: Package, tone: "primary" },
  documentos: { icon: FileText, tone: "doc" },
  cliente: { icon: User, tone: "orange" },
  processada: { icon: CheckCircle2, tone: "info" },
  envio: { icon: Send, tone: "success" },
  erro: { icon: AlertTriangle, tone: "destructive" },
} as const;

export function EventoIcon({ tipo }: { tipo: Evento["tipo"] }) {
  const m = map[tipo];
  return <IconTile icon={m.icon} tone={m.tone} size="sm" />;
}
