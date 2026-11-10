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
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 32% 46%, ${cor}2E 0%, ${COR.fundo2} 38%, ${COR.fundo} 75%)`,
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
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, opacity: 1 - saida, translate: `0px ${-saida * 60}px` }}>
      <div style={{ fontFamily: FONTE_TEXTO, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: GENEROS.disco.cor, opacity: subt, marginBottom: 22 }}>
        DE ONDE VEM O SOM DA PISTA?
      </div>
      <LetrasCineticas texto="A ÁRVORE GENEALÓGICA" tamanho={92} cor={COR.texto} atraso={6} passo={1.5} />
      <LetrasCineticas texto="DA MÚSICA ELETRÔNICA" tamanho={92} cor={GENEROS.house.cor} atraso={18} passo={1.5} />
    </AbsoluteFill>
  );
};

const Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inicio = Math.round(cenaPorId("outro").falaFim * fps);
  const p = interpolate(frame, [inicio, inicio + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < inicio) return null;
  const fade = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `rgba(11,8,20,${0.78 * p})`, justifyContent: "center", alignItems: "center", opacity: fade }}>
      <Sequence from={inicio} layout="none">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <LetrasCineticas texto="QUAL GALHO" tamanho={110} cor={COR.texto} passo={1.5} />
          <LetrasCineticas texto="É O SEU?" tamanho={110} cor={GENEROS.disco.cor} atraso={8} passo={1.5} />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fundo />
      <Arvore />
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
    <Composition
      id="ArvoreEletronica"
      component={Video}
      durationInFrames={Math.ceil(DURACAO_S * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
