// Mock data shared across the prototype. Shapes mirror the future backend entities:
// Cliente 1—N Viagem 1—N Documento, Viagem 1—N EnvioEmail.

export type StatusProc = "processada" | "processando" | "pendente" | "erro";
export type StatusEnvio = "enviado" | "aguardando" | "pendente" | "erro";
export type TipoDoc = "ZIP" | "XML" | "PDF Viagem" | "PDF Fatura";
export type StatusDoc = "identificado" | "pendente" | "erro";

export interface Cliente {
  id: string; nome: string; cnpj: string; email: string; emailsCopia: string[];
  cidade: string; contato: string; telefone: string; ativo: boolean;
}
export interface Viagem {
  id: string; numero: string; data: string; clienteId: string; origem: string; destino: string;
  motorista: string; placa: string; valor: number; statusProc: StatusProc; statusEnvio: StatusEnvio;
  etapa: number; // index of current/failed step (9 = all done)
  erro?: string | undefined;
}
export interface Documento {
  id: string; viagemId: string; tipo: TipoDoc; nome: string; tamanho: string; data: string; status: StatusDoc;
}
export interface EnvioEmail {
  id: string; viagemId: string; clienteId: string; destinatario: string; assunto: string;
  data: string; status: StatusEnvio; tentativas: number; mensagem: string;
}
export interface Evento {
  id: string; data: string; viagemId: string; tipo: "processada" | "documentos" | "cliente" | "envio" | "erro" | "zip";
  titulo: string; descricao: string;
}

export const ETAPAS = [
  "Identificação da viagem", "Localização do ZIP", "Organização dos arquivos", "Identificação do XML",
  "PDF da viagem", "PDF da fatura", "Identificação do cliente", "Identificação do e-mail", "Envio dos documentos",
];

let seed = 42;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)]!;

export const clientes: Cliente[] = [
  ["Transportes Rodobens Ltda", "São Paulo/SP", "Marcos Lima", "rodobens.com.br"],
  ["Agro Cerrado Alimentos S.A.", "Rio Verde/GO", "Fernanda Reis", "agrocerrado.com.br"],
  ["Metalúrgica Vale do Aço", "Ipatinga/MG", "Ricardo Souza", "valedoaco.ind.br"],
  ["Distribuidora Sul Brasil", "Curitiba/PR", "Juliana Prado", "sulbrasil.com.br"],
  ["Química Paulista Ind.", "Campinas/SP", "André Matos", "quimicapaulista.com.br"],
  ["Celulose Litoral S.A.", "Três Lagoas/MS", "Patrícia Gomes", "celuloselitoral.com.br"],
  ["Bebidas Nordeste Ltda", "Recife/PE", "Thiago Alves", "bebidasne.com.br"],
  ["Cooperativa Grãos do Oeste", "Cascavel/PR", "Luciana Ferraz", "graosoeste.coop.br"],
].map(([nome, cidade, contato, dom]: string[], i) => ({
  nome: nome!, cidade: cidade!, contato: contato!,
  id: `c${i + 1}`,
  cnpj: `${10 + i * 7}.${300 + i * 41}.${120 + i * 13}/0001-${10 + i * 9}`,
  email: `fiscal@${dom}`, emailsCopia: [`logistica@${dom}`],
  telefone: `(11) 9${8000 + i * 137}-${1000 + i * 311}`, ativo: i !== 6,
}));

const cidades = ["Santos/SP", "Paranaguá/PR", "Belo Horizonte/MG", "Goiânia/GO", "Campinas/SP", "Uberlândia/MG", "Salvador/BA", "Porto Alegre/RS", "Cuiabá/MT", "Vitória/ES"];
const motoristas = ["José Pereira", "Carlos Mendes", "Antônio Silva", "Paulo Rocha", "Ronaldo Dias", "Edson Martins", "Wagner Costa"];
const erros: Record<number, string> = {
  1: "Arquivo ZIP não localizado na pasta de rede.",
  3: "XML inválido: chave de acesso não encontrada.",
  5: "PDF da fatura ausente no pacote.",
  7: "Nenhum e-mail cadastrado para o cliente.",
  8: "Falha SMTP: caixa de destino cheia (552).",
};

const fmt = (d: Date) => d.toISOString();
const base = new Date("2026-10-07T18:00:00Z").getTime();

export const viagens: Viagem[] = Array.from({ length: 36 }, (_, i) => {
  const r = rnd();
  let statusProc: StatusProc, statusEnvio: StatusEnvio, etapa: number, erro: string | undefined;
  if (i < 3) { statusProc = "processando"; statusEnvio = "aguardando"; etapa = 2 + i * 2; }
  else if (r < 0.62) { statusProc = "processada"; statusEnvio = "enviado"; etapa = 9; }
  else if (r < 0.75) { statusProc = "processada"; statusEnvio = "erro"; etapa = 8; erro = erros[8]; }
  else if (r < 0.87) { statusProc = "pendente"; statusEnvio = "pendente"; etapa = pick([1, 2]); }
  else { etapa = pick([1, 3, 5, 7]); statusProc = "erro"; statusEnvio = "pendente"; erro = erros[etapa]; }
  return {
    id: `v${i + 1}`, numero: `VG-${(48210 - i).toString()}`,
    data: fmt(new Date(base - i * 1000 * 60 * 60 * 9.5)),
    clienteId: clientes[i % clientes.length]!.id,
    origem: pick(cidades), destino: pick(cidades), motorista: pick(motoristas),
    placa: `${pick(["QRT", "BRA", "FXK", "MNP", "RTE"])}${Math.floor(rnd() * 9)}${pick(["A", "C", "F", "J"])}${10 + Math.floor(rnd() * 89)}`,
    valor: Math.round(2500 + rnd() * 18000), statusProc, statusEnvio, etapa, ...(erro ? { erro } : {}),
  };
});

export const documentos: Documento[] = viagens.flatMap((v) => {
  const tipos: TipoDoc[] = ["ZIP", "XML", "PDF Viagem", "PDF Fatura"];
  const step: Record<TipoDoc, number> = { ZIP: 1, XML: 3, "PDF Viagem": 4, "PDF Fatura": 5 };
  return tipos
    .filter((t) => !(v.etapa === 1 && v.statusProc !== "processada" && t !== "ZIP" && v.statusProc === "erro"))
    .map((t, j) => {
      const s = step[t];
      const status: StatusDoc = v.etapa > s || v.statusProc === "processada" ? "identificado" : v.etapa === s && v.statusProc === "erro" ? "erro" : "pendente";
      const ext = t === "ZIP" ? "zip" : t === "XML" ? "xml" : "pdf";
      const slug = t === "PDF Viagem" ? "viagem" : t === "PDF Fatura" ? "fatura" : t === "XML" ? "cte" : "pacote";
      return {
        id: `${v.id}-d${j}`, viagemId: v.id, tipo: t, nome: `${v.numero}_${slug}.${ext}`,
        tamanho: t === "ZIP" ? "1,8 MB" : t === "XML" ? "24 KB" : `${180 + j * 37} KB`, data: v.data, status,
      };
    });
});

export const envios: EnvioEmail[] = viagens
  .filter((v) => v.statusEnvio === "enviado" || v.statusEnvio === "erro" || v.statusEnvio === "aguardando")
  .map((v, i) => {
    const c = clientes.find((c) => c.id === v.clienteId)!;
    return {
      id: `e${i + 1}`, viagemId: v.id, clienteId: c.id, destinatario: c.email,
      assunto: `Documentos da viagem ${v.numero}`,
      data: fmt(new Date(new Date(v.data).getTime() + 1000 * 60 * 42)), status: v.statusEnvio,
      tentativas: v.statusEnvio === "erro" ? 3 : 1,
      mensagem: v.statusEnvio === "erro" ? v.erro ?? "Falha no envio" : v.statusEnvio === "aguardando" ? "Na fila de envio" : "250 OK — mensagem aceita pelo servidor",
    };
  });

export const eventos: Evento[] = viagens.slice(0, 18).flatMap((v) => {
  const t0 = new Date(v.data).getTime();
  const at = (m: number) => fmt(new Date(t0 + m * 60000));
  const cli = getCliente(v.clienteId).nome;
  const ev: Evento[] = [{ id: `${v.id}-a`, data: at(0), viagemId: v.id, tipo: "zip", titulo: "Viagem identificada", descricao: `${v.numero} registrada — ${v.origem} → ${v.destino}` }];
  if (v.etapa > 5 || v.statusProc === "processada") ev.push({ id: `${v.id}-b`, data: at(12), viagemId: v.id, tipo: "documentos", titulo: "Documentos identificados", descricao: "XML, PDF da viagem e PDF da fatura organizados" });
  if (v.etapa > 6) ev.push({ id: `${v.id}-c`, data: at(20), viagemId: v.id, tipo: "cliente", titulo: "Cliente encontrado", descricao: cli });
  if (v.statusProc === "processada") ev.push({ id: `${v.id}-p`, data: at(25), viagemId: v.id, tipo: "processada", titulo: "Viagem processada", descricao: "Todas as etapas de tratamento concluídas" });
  if (v.statusEnvio === "enviado") ev.push({ id: `${v.id}-d`, data: at(42), viagemId: v.id, tipo: "envio", titulo: "Envio realizado", descricao: `Documentos enviados para ${getCliente(v.clienteId).email}` });
  if (v.erro) ev.push({ id: `${v.id}-e`, data: at(30), viagemId: v.id, tipo: "erro", titulo: "Erro no processamento", descricao: v.erro });
  return ev;
}).sort((a, b) => b.data.localeCompare(a.data));

export function getCliente(id: string) { return clientes.find((c) => c.id === id)!; }
export function getViagem(id: string) { return viagens.find((v) => v.id === id); }

export function stepState(v: Viagem, i: number): "concluida" | "atual" | "erro" | "pendente" {
  if (v.etapa >= 9 || i < v.etapa) return "concluida";
  if (i === v.etapa) return v.erro ? "erro" : v.statusProc === "processando" ? "atual" : "pendente";
  return "pendente";
}

export const fmtData = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
export const fmtDataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtMoeda = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
