import React from "react";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Arvore, generoAtivo } from "./Arvore";
import { CENAS, COR, DURACAO_S, FONTE_TEXTO, FONTE_TITULO, FPS, GENEROS, IdGenero, cenaPorId } from "./dados";
import { Legenda } from "./Legenda";
import { LetrasCineticas, Painel } from "./Painel";
import { useLayout } from "./layout";

const fontes = Promise.all([
  ...[400, 700, 900].map((w) =>
    loadFont({ family: FONTE_TITULO, url: staticFile(`fonts/unbounded-latin-${w}-normal.woff2`), weight: String(w) }),
  ),
  ...[400, 500, 700].map((w) =>
    loadFont({ family: FONTE_TEXTO, url: staticFile(`fonts/dm-sans-latin-${w}-normal.woff2`), weight: String(w) }),
  ),
]);

const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  await fontes;
  return { durationInFrames: Math.ceil(DURACAO_S * FPS) };
};

const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ativo = generoAtivo(frame / fps);
  const cor = ativo ? GENEROS[ativo].cor : GENEROS.disco.cor;
  const L = useLayout();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${L.focoX}px ${L.focoY}px, ${cor}2E 0%, ${COR.fundo2} 38%, ${COR.fundo} 75%)`,
      }}
    />
  );
};

const Grao: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "screen", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fim = Math.round(cenaPorId("intro").fim * fps);
  const saida = interpolate(frame, [fim - 14, fim], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const subt = interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const L = useLayout();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: L.intro.paddingTop, opacity: 1 - saida, translate: `0px ${-saida * 60}px` }}>
      <div style={{ fontFamily: FONTE_TEXTO, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: GENEROS.disco.cor, opacity: subt, marginBottom: 22 }}>
        DE ONDE VEM O SOM DA PISTA?
      </div>
      {L.intro.linhas.map((l, i) => (
        <LetrasCineticas key={l.texto} texto={l.texto} tamanho={L.intro.tamanho} cor={l.cor === "texto" ? COR.texto : GENEROS.house.cor} atraso={6 + i * 8} passo={1.5} />
      ))}
    </AbsoluteFill>
  );
};

const Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const L = useLayout();
  const inicio = Math.round(cenaPorId("outro").falaFim * fps);
  const p = interpolate(frame, [inicio, inicio + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < inicio) return null;
  const fade = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `rgba(11,8,20,${0.78 * p})`, justifyContent: "center", alignItems: "center", opacity: fade }}>
      <Sequence from={inicio} layout="none">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <LetrasCineticas texto="QUAL GALHO" tamanho={L.fimTamanho} cor={COR.texto} passo={1.5} />
          <LetrasCineticas texto="É O SEU?" tamanho={L.fimTamanho} cor={GENEROS.disco.cor} atraso={8} passo={1.5} />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

// Na versão vertical, escurece a metade de baixo para o cartão ficar legível sobre a árvore.
const Veu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  if (!L.vertical) return null;
  const t = frame / fps;
  const a = cenaPorId("disco").inicio;
  const b = cenaPorId("outro").inicio;
  const op = interpolate(t, [a, a + 0.6, b, b + 0.8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity: op,
        background: `linear-gradient(180deg, ${COR.fundo}00 0px, ${COR.fundo}00 640px, ${COR.fundo}E6 800px, ${COR.fundo}F2 1920px)`,
      }}
    />
  );
};

export const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fundo />
      <Arvore />
      <Veu />
      <Sequence durationInFrames={Math.round(cenaPorId("intro").fim * fps)} name="Intro">
        <Intro />
      </Sequence>
      {CENAS.filter((c) => c.id in GENEROS).map((c) => {
        const de = Math.round(c.inicio * fps);
        const dur = Math.round(c.fim * fps) - de;
        return (
          <Sequence key={c.id} from={de} durationInFrames={dur} name={`Painel ${c.id}`}>
            <Painel g={GENEROS[c.id as IdGenero]} duracao={dur} />
          </Sequence>
        );
      })}
      <Legenda />
      <Encerramento />
      <Grao />
      <Audio src={staticFile("narracao.wav")} />
      <Audio src={staticFile("trilha.wav")} volume={0.2} />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="ArvoreEletronica"
        component={Video}
        durationInFrames={Math.ceil(DURACAO_S * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ArvoreEletronicaReel"
        component={Video}
        durationInFrames={Math.ceil(DURACAO_S * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
