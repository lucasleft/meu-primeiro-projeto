import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, FONTE_TEXTO, FONTE_TITULO, Genero } from "./dados";

// Texto cinético: cada letra sobe girando, com atraso em cascata.
export const LetrasCineticas: React.FC<{
  texto: string;
  tamanho: number;
  cor: string;
  atraso?: number;
  passo?: number;
  peso?: number;
}> = ({ texto, tamanho, cor, atraso = 0, passo = 2, peso = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", fontFamily: FONTE_TITULO, fontWeight: peso, fontSize: tamanho, color: cor, lineHeight: 1, overflow: "hidden", paddingBottom: tamanho * 0.12 }}>
      {texto.split("").map((ch, i) => {
        const s = spring({ frame: frame - atraso - i * passo, fps, config: { damping: 13, stiffness: 170, mass: 0.6 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              translate: `0px ${(1 - s) * tamanho * 1.1}px`,
              rotate: `${(1 - s) * 18}deg`,
              opacity: Math.min(1, s * 1.6),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const Painel: React.FC<{ g: Genero; duracao: number }> = ({ g, duracao }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const saida = interpolate(frame, [duracao - 10, duracao], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const tamanhoNome = Math.min(118, 700 / (g.nome.length * 0.86));
  const linhaEntrada = interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // contador de BPM
  const bpmMostrado = Math.round(
    interpolate(frame, [14, 40], [60, g.bpm], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
  );
  const periodo = 60 / g.bpm;
  const pulso = Math.exp(-((t % periodo) / periodo) * 6);

  const ent = (atraso: number) => {
    const s = spring({ frame: frame - atraso, fps, config: { damping: 18, stiffness: 140 } });
    return { opacity: s, translate: `${(1 - s) * 60}px 0px` };
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 1110,
          top: 170,
          width: 730,
          opacity: 1 - saida,
          translate: `${saida * 80}px 0px`,
        }}
      >
        <div style={{ ...ent(0), fontFamily: FONTE_TEXTO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: g.cor }}>
          {g.epoca} · {g.local}
        </div>
        <div style={{ height: 6, width: 220 * linhaEntrada, background: g.cor, margin: "22px 0 18px", borderRadius: 3 }} />
        <LetrasCineticas texto={g.nome} tamanho={tamanhoNome} cor={COR.texto} atraso={4} />

        <div style={{ ...ent(14), display: "flex", alignItems: "center", gap: 26, marginTop: 26 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: g.cor,
              scale: String(1 + 0.45 * pulso),
              boxShadow: `0 0 ${20 + 40 * pulso}px ${g.cor}`,
            }}
          />
          <div style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 64, color: COR.texto, fontVariantNumeric: "tabular-nums" }}>
            {bpmMostrado}
            <span style={{ fontSize: 30, color: COR.textoSuave, marginLeft: 14, fontFamily: FONTE_TEXTO, fontWeight: 500 }}>
              BPM · faixa {g.faixaBpm.replace(" BPM", "")}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 18 }}>
          {g.tracos.map((tr, i) => (
            <div key={tr} style={{ ...ent(26 + i * 7), display: "flex", alignItems: "center", gap: 20, fontFamily: FONTE_TEXTO, fontWeight: 500, fontSize: 40, color: COR.texto }}>
              <div style={{ width: 14, height: 14, rotate: "45deg", background: g.cor, flexShrink: 0 }} />
              {tr}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
