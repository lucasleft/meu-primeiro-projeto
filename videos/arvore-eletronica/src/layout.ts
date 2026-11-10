import { useVideoConfig } from "remotion";

type Cam = { wx: number; wy: number; z: number; sx: number; sy: number };

export type Layout = {
  vertical: boolean;
  camIntro: Cam;
  camFim: Cam;
  focoX: number;
  focoY: number;
  zoomFoco: number;
  painel: { left: number; top: number; width: number; tamanhoMax: number; larguraNome: number; fonteTraco: number };
  legenda: { paddingBottom: number; maxWidth: number; fontSize: number };
  intro: { paddingTop: number; linhas: { texto: string; cor: "texto" | "destaque" }[]; tamanho: number };
  fimTamanho: number;
};

const HORIZONTAL: Layout = {
  vertical: false,
  camIntro: { wx: 960, wy: 600, z: 0.78, sx: 960, sy: 680 },
  camFim: { wx: 965, wy: 575, z: 0.84, sx: 960, sy: 440 },
  focoX: 600,
  focoY: 450,
  zoomFoco: 1.45,
  painel: { left: 1110, top: 170, width: 730, tamanhoMax: 118, larguraNome: 700, fonteTraco: 40 },
  legenda: { paddingBottom: 70, maxWidth: 1560, fontSize: 42 },
  intro: {
    paddingTop: 110,
    tamanho: 92,
    linhas: [
      { texto: "A ÁRVORE GENEALÓGICA", cor: "texto" },
      { texto: "DA MÚSICA ELETRÔNICA", cor: "destaque" },
    ],
  },
  fimTamanho: 110,
};

// Reel 1080x1920: evita o topo (~220px) e a base (~380px), cobertos pela interface do app.
const VERTICAL: Layout = {
  vertical: true,
  camIntro: { wx: 965, wy: 600, z: 0.86, sx: 540, sy: 1060 },
  camFim: { wx: 965, wy: 575, z: 0.86, sx: 540, sy: 760 },
  focoX: 540,
  focoY: 470,
  zoomFoco: 1.3,
  painel: { left: 90, top: 800, width: 900, tamanhoMax: 124, larguraNome: 880, fonteTraco: 36 },
  legenda: { paddingBottom: 360, maxWidth: 940, fontSize: 42 },
  intro: {
    paddingTop: 250,
    tamanho: 100,
    linhas: [
      { texto: "A ÁRVORE", cor: "texto" },
      { texto: "GENEALÓGICA", cor: "texto" },
      { texto: "DA MÚSICA", cor: "destaque" },
      { texto: "ELETRÔNICA", cor: "destaque" },
    ],
  },
  fimTamanho: 120,
};

export const useLayout = (): Layout => {
  const { width, height } = useVideoConfig();
  return height > width ? VERTICAL : HORIZONTAL;
};
