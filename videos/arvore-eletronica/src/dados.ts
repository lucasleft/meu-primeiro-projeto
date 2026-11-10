import tempos from "./tempos.json";

export const FPS = 30;
export const LARGURA = 1920;
export const ALTURA = 1080;

export const COR = {
  fundo: "#0B0814",
  fundo2: "#160F26",
  texto: "#F6F1E7",
  textoSuave: "rgba(246,241,231,0.62)",
  linhaFantasma: "rgba(246,241,231,0.10)",
};

export const FONTE_TITULO = "Unbounded";
export const FONTE_TEXTO = "DM Sans";

export type IdGenero =
  | "disco"
  | "house"
  | "techno"
  | "trance"
  | "dnb"
  | "ukg"
  | "dubstep";

export type Genero = {
  id: IdGenero;
  nome: string;
  cor: string;
  x: number;
  y: number;
  raio: number;
  epoca: string;
  local: string;
  bpm: number;
  faixaBpm: string;
  tracos: string[];
};

// Posições no "mundo" (1920x1080). A raiz fica embaixo e a árvore cresce para cima.
export const GENEROS: Record<IdGenero, Genero> = {
  disco: {
    id: "disco",
    nome: "DISCO",
    cor: "#FFB800",
    x: 960,
    y: 930,
    raio: 34,
    epoca: "ANOS 70",
    local: "NOVA YORK · EUA",
    bpm: 118,
    faixaBpm: "110–125 BPM",
    tracos: ["Bumbo em todos os tempos (4/4)", "Baixo dançante e orquestra", "Nasceu para a pista"],
  },
  house: {
    id: "house",
    nome: "HOUSE",
    cor: "#FF4FD8",
    x: 960,
    y: 690,
    raio: 30,
    epoca: "ANOS 80",
    local: "CHICAGO · EUA",
    bpm: 124,
    faixaBpm: "120–128 BPM",
    tracos: ["Baterias eletrônicas (808 e 909)", "O groove da disco em loop", "Pianos e vocais marcantes"],
  },
  techno: {
    id: "techno",
    nome: "TECHNO",
    cor: "#3DDCFF",
    x: 600,
    y: 470,
    raio: 28,
    epoca: "ANOS 80",
    local: "DETROIT · EUA",
    bpm: 130,
    faixaBpm: "125–140 BPM",
    tracos: ["Som frio e mecânico", "Loops repetitivos e hipnóticos", "Pouca melodia, muito ritmo"],
  },
  trance: {
    id: "trance",
    nome: "TRANCE",
    cor: "#A970FF",
    x: 410,
    y: 225,
    raio: 26,
    epoca: "ANOS 90",
    local: "ALEMANHA",
    bpm: 138,
    faixaBpm: "130–140 BPM",
    tracos: ["Melodias longas e emotivas", "Pausas e subidas épicas", "Sintetizadores em camadas"],
  },
  dnb: {
    id: "dnb",
    nome: "DRUM & BASS",
    cor: "#2EF2A0",
    x: 960,
    y: 400,
    raio: 28,
    epoca: "ANOS 90",
    local: "REINO UNIDO",
    bpm: 174,
    faixaBpm: "160–180 BPM",
    tracos: ["Breakbeats acelerados", "Grave (sub) em destaque", "Filho das raves e do jungle"],
  },
  ukg: {
    id: "ukg",
    nome: "UK GARAGE",
    cor: "#FF9A3D",
    x: 1330,
    y: 480,
    raio: 20,
    epoca: "ANOS 90",
    local: "LONDRES",
    bpm: 132,
    faixaBpm: "130–135 BPM",
    tracos: [],
  },
  dubstep: {
    id: "dubstep",
    nome: "DUBSTEP",
    cor: "#FF3D5E",
    x: 1520,
    y: 235,
    raio: 28,
    epoca: "ANOS 2000",
    local: "LONDRES · UK",
    bpm: 140,
    faixaBpm: "140 BPM (meio tempo)",
    tracos: ["Sensação de meio tempo", "Graves pesados que “balançam”", "Veio do UK garage e do dub"],
  },
};

export type Ramo = { de: IdGenero; para: IdGenero; cena: string; atraso: number };

export const RAMOS: Ramo[] = [
  { de: "disco", para: "house", cena: "house", atraso: 0 },
  { de: "house", para: "techno", cena: "techno", atraso: 0 },
  { de: "techno", para: "trance", cena: "trance", atraso: 0 },
  { de: "house", para: "dnb", cena: "dnb", atraso: 0 },
  { de: "house", para: "ukg", cena: "dubstep", atraso: 0 },
  { de: "ukg", para: "dubstep", cena: "dubstep", atraso: 0.7 },
];

export type Cena = {
  id: string;
  texto: string;
  bpm: number;
  inicio: number;
  fim: number;
  falaInicio: number;
  falaFim: number;
};

export const CENAS: Cena[] = tempos.cenas;
export const DURACAO_S: number = tempos.duracao;

export const cenaPorId = (id: string) => {
  const c = CENAS.find((x) => x.id === id);
  if (!c) throw new Error(`Cena não encontrada: ${id}`);
  return c;
};

// Ponto de controle da curva de um ramo: sai do pai subindo e chega no filho por baixo.
export const curvaRamo = (de: Genero, para: Genero) => {
  const meioY = (de.y + para.y) / 2;
  return {
    p0: { x: de.x, y: de.y },
    p1: { x: de.x, y: meioY },
    p2: { x: para.x, y: meioY },
    p3: { x: para.x, y: para.y },
  };
};

export const pontoBezier = (c: ReturnType<typeof curvaRamo>, t: number) => {
  const u = 1 - t;
  return {
    x: u * u * u * c.p0.x + 3 * u * u * t * c.p1.x + 3 * u * t * t * c.p2.x + t * t * t * c.p3.x,
    y: u * u * u * c.p0.y + 3 * u * u * t * c.p1.y + 3 * u * t * t * c.p2.y + t * t * t * c.p3.y,
  };
};
