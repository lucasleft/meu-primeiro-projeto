import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CENAS,
  COR,
  FONTE_TITULO,
  GENEROS,
  Genero,
  IdGenero,
  RAMOS,
  cenaPorId,
  curvaRamo,
  pontoBezier,
} from "./dados";

type Camera = { wx: number; wy: number; z: number; sx: number; sy: number };

const FOCO_X = 600;
const FOCO_Y = 450;

const cameraDaCena = (id: string): Camera => {
  if (id === "intro") return { wx: 960, wy: 600, z: 0.78, sx: 960, sy: 680 };
  if (id === "outro") return { wx: 965, wy: 575, z: 0.84, sx: 960, sy: 440 };
  const g = GENEROS[id as IdGenero];
  return { wx: g.x, wy: g.y, z: 1.45, sx: FOCO_X, sy: FOCO_Y };
};

const DURACAO_MOV = 1.1; // segundos de movimento de câmera

export const useCamera = (t: number): Camera => {
  let i = CENAS.findIndex((c) => t >= c.inicio && t < c.fim);
  if (i < 0) i = CENAS.length - 1;
  const atual = cameraDaCena(CENAS[i].id);
  if (i === 0) {
    // leve aproximação durante a intro
    const p = interpolate(t, [0, CENAS[0].fim], [0, 1], { extrapolateRight: "clamp" });
    return { ...atual, z: atual.z * (1 + 0.04 * p) };
  }
  const anterior = cameraDaCena(CENAS[i - 1].id);
  const p = interpolate(t, [CENAS[i].inicio, CENAS[i].inicio + DURACAO_MOV], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.25, 1),
  });
  const mix = (a: number, b: number) => a + (b - a) * p;
  return {
    wx: mix(anterior.wx, atual.wx),
    wy: mix(anterior.wy, atual.wy),
    z: mix(anterior.z, atual.z),
    sx: mix(anterior.sx, atual.sx),
    sy: mix(anterior.sy, atual.sy),
  };
};

// Quando cada ramo começa a crescer (em segundos)
const inicioRamo = (cena: string, atraso: number) => cenaPorId(cena).inicio + 0.35 + atraso;
const DURACAO_RAMO = 1.0;

// Quando cada nó aparece
const aparicaoNo = (id: IdGenero): number => {
  if (id === "disco") return cenaPorId("disco").inicio + 0.3;
  const r = RAMOS.find((x) => x.para === id)!;
  return inicioRamo(r.cena, r.atraso) + DURACAO_RAMO * 0.85;
};

// Gênero em destaque em cada instante
export const generoAtivo = (t: number): IdGenero | null => {
  const c = CENAS.find((x) => t >= x.inicio && t < x.fim);
  if (!c || c.id === "intro" || c.id === "outro") return null;
  return c.id as IdGenero;
};

const pulsoBatida = (t: number, bpm: number) => {
  const periodo = 60 / bpm;
  const fase = (t % periodo) / periodo;
  return Math.exp(-fase * 6);
};

const Ramo: React.FC<{ de: Genero; para: Genero; t: number; inicio: number; fantasma?: boolean }> = ({
  de,
  para,
  t,
  inicio,
  fantasma,
}) => {
  const c = curvaRamo(de, para);
  const d = `M ${c.p0.x} ${c.p0.y} C ${c.p1.x} ${c.p1.y}, ${c.p2.x} ${c.p2.y}, ${c.p3.x} ${c.p3.y}`;
  if (fantasma) {
    return <path d={d} stroke="rgba(246,241,231,0.22)" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" fill="none" />;
  }
  const p = interpolate(t, [inicio, inicio + DURACAO_RAMO], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  if (p <= 0) return null;
  const ponta = pontoBezier(c, p);
  const id = `grad-${de.id}-${para.id}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={de.x} y1={de.y} x2={para.x} y2={para.y}>
          <stop offset="0%" stopColor={de.cor} />
          <stop offset="100%" stopColor={para.cor} />
        </linearGradient>
      </defs>
      {/* brilho largo */}
      <path d={d} stroke={`url(#${id})`} strokeOpacity={0.25} strokeWidth={22} fill="none" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" style={{ filter: "blur(10px)" }} />
      <path d={d} stroke={`url(#${id})`} strokeWidth={7} fill="none" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" />
      {p < 1 ? (
        <g>
          <circle cx={ponta.x} cy={ponta.y} r={22} fill={para.cor} opacity={0.35} style={{ filter: "blur(8px)" }} />
          <circle cx={ponta.x} cy={ponta.y} r={7} fill="#fff" />
        </g>
      ) : null}
    </g>
  );
};

const No: React.FC<{ g: Genero; t: number; fps: number; ativo: boolean; final: boolean }> = ({ g, t, fps, ativo, final }) => {
  const inicio = aparicaoNo(g.id);
  if (t < inicio) {
    return (
      <g>
        <circle cx={g.x} cy={g.y} r={g.raio * 0.6} fill="none" stroke="rgba(246,241,231,0.25)" strokeWidth={3} />
        <text x={g.x} y={g.y + 9} textAnchor="middle" fill="rgba(246,241,231,0.35)" style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 24 }}>?</text>
      </g>
    );
  }
  const f = Math.round((t - inicio) * fps);
  const entrada = spring({ frame: f, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  const pulso = ativo ? pulsoBatida(t, g.bpm) : 0;
  const r = g.raio * entrada * (1 + 0.14 * pulso);
  const onda = interpolate(f, [0, 0.9 * fps], [0, 1], { extrapolateRight: "clamp" });
  const destaque = ativo || final ? 1 : 0.55;
  const rotuloOp = interpolate(f, [6, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (ativo ? 0 : final ? 1 : 0.7);
  return (
    <g>
      {/* onda de choque ao surgir */}
      {onda < 1 ? (
        <circle cx={g.x} cy={g.y} r={g.raio + onda * 120} fill="none" stroke={g.cor} strokeWidth={4 * (1 - onda)} opacity={1 - onda} />
      ) : null}
      {/* sulcos de vinil */}
      {[1.6, 2.15, 2.7].map((k) => (
        <circle key={k} cx={g.x} cy={g.y} r={r * k} fill="none" stroke={g.cor} strokeWidth={1.5}
          opacity={(ativo ? 0.35 : 0.12) * entrada * (1 - (k - 1.6) / 2)} />
      ))}
      <circle cx={g.x} cy={g.y} r={r * 1.9} fill={g.cor} opacity={0.22 * destaque + 0.25 * pulso} style={{ filter: "blur(18px)" }} />
      <circle cx={g.x} cy={g.y} r={r} fill={g.cor} opacity={0.6 + 0.4 * destaque} />
      <circle cx={g.x} cy={g.y} r={r * 0.28} fill={COR.fundo} />
      <text x={g.x < 900 ? g.x - g.raio - 26 : g.x + g.raio + 26} y={g.y + 9} textAnchor={g.x < 900 ? "end" : "start"} fill={COR.texto} opacity={rotuloOp}
        style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: g.id === "ukg" ? 22 : 26, letterSpacing: 2 }}>
        {g.nome}
      </text>
    </g>
  );
};

export const Arvore: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const cam = useCamera(t);
  const ativo = generoAtivo(t);
  const final = t >= cenaPorId("outro").inicio;
  const corAtiva = ativo ? GENEROS[ativo].cor : GENEROS.disco.cor;

  const fantasmaOp = interpolate(t, [0.4, 2.2, cenaPorId("outro").inicio, cenaPorId("outro").inicio + 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${cam.sx} ${cam.sy}) scale(${cam.z}) translate(${-cam.wx} ${-cam.wy})`}>
          {/* raízes decorativas sob o disco */}
          <g opacity={0.5}>
            {[-160, -70, 0, 80, 170].map((dx, i) => {
              const p = interpolate(t, [0.6 + i * 0.12, 3 + i * 0.12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              });
              const { x, y } = GENEROS.disco;
              return (
                <path key={dx} d={`M ${x} ${y} C ${x} ${y + 60}, ${x + dx} ${y + 40}, ${x + dx * 1.3} ${y + 170}`}
                  stroke={GENEROS.disco.cor} strokeOpacity={0.35} strokeWidth={3} fill="none" pathLength={1}
                  strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" />
              );
            })}
          </g>
          <g opacity={fantasmaOp}>
            {RAMOS.map((r) => (
              <Ramo key={`f-${r.para}`} de={GENEROS[r.de]} para={GENEROS[r.para]} t={t} inicio={0} fantasma />
            ))}
          </g>
          {RAMOS.map((r) => (
            <Ramo key={r.para} de={GENEROS[r.de]} para={GENEROS[r.para]} t={t} inicio={inicioRamo(r.cena, r.atraso)} />
          ))}
          {(Object.keys(GENEROS) as IdGenero[]).map((id) => (
            <No key={id} g={GENEROS[id]} t={t} fps={fps} ativo={ativo === id} final={final} />
          ))}
        </g>
      </svg>
      {/* vinheta colorida pelo gênero ativo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${FOCO_X}px ${FOCO_Y}px, ${corAtiva}00 30%, ${COR.fundo}CC 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
