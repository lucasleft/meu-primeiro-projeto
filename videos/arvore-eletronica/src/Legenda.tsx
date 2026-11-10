import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CENAS, COR, FONTE_TEXTO, GENEROS, IdGenero } from "./dados";

// Legenda sincronizada: as palavras acendem conforme a narração avança.
export const Legenda: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const cena = CENAS.find((c) => t >= c.falaInicio - 0.2 && t < c.falaFim + 0.35);
  if (!cena) return null;

  const cor = GENEROS[cena.id as IdGenero]?.cor ?? GENEROS.disco.cor;
  const palavras = cena.texto.split(" ");
  const totalLetras = palavras.reduce((s, p) => s + p.length + 1, 0);
  const progresso = interpolate(t, [cena.falaInicio, cena.falaFim], [0, totalLetras], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacidade = interpolate(t, [cena.falaInicio - 0.2, cena.falaInicio, cena.falaFim + 0.15, cena.falaFim + 0.35], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let acumulado = 0;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70, pointerEvents: "none" }}>
      <div
        style={{
          opacity: opacidade,
          maxWidth: 1560,
          padding: "20px 36px",
          borderRadius: 18,
          background: "rgba(11,8,20,0.72)",
          borderLeft: `6px solid ${cor}`,
          fontFamily: FONTE_TEXTO,
          fontWeight: 500,
          fontSize: 42,
          lineHeight: 1.3,
          textAlign: "center",
          color: COR.textoSuave,
        }}
      >
        {palavras.map((p, i) => {
          const inicio = acumulado;
          acumulado += p.length + 1;
          const aceso = interpolate(progresso, [inicio, inicio + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ color: aceso > 0.5 ? COR.texto : COR.textoSuave, opacity: 0.55 + 0.45 * aceso }}>
              {p}{" "}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
