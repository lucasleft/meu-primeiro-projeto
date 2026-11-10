"""Gera a narração, a trilha de batidas e o arquivo de tempos das cenas.

Dois motores de voz:

1) OmniVoice (o modelo do VoiceStudio), clonando a voz de scripts/referencia-voz.wav  [padrão]
   pip install torch torchaudio omnivoice soundfile numpy
   python3 scripts/gerar_audio.py --motor omnivoice
   Atenção: os pesos do OmniVoice têm licença CC-BY-NC (uso não comercial).

2) Kokoro (voz pt-BR pronta)
   pip install kokoro-onnx soundfile numpy
   baixe kokoro-v1.0.onnx e voices-v1.0.bin (releases de thewh1teagle/kokoro-onnx)
   python3 scripts/gerar_audio.py --motor kokoro --modelo kokoro-v1.0.onnx --vozes voices-v1.0.bin --voz pm_alex
"""

import argparse
import json
import wave
from pathlib import Path

import numpy as np

SR = 44100
INICIO = 0.6  # silêncio antes da primeira fala (s)
PAUSA = 0.35  # pausa entre falas (s)
FINAL = 1.6  # respiro depois da última fala (s)

# Transcrição de scripts/referencia-voz.wav (usada para clonar a voz no OmniVoice)
REF_TEXTO = "A raiz é a disco, nos anos setenta: o bumbo marca todos os tempos. É o famoso quatro por quatro."

# id, texto falado, BPM da batida de fundo, padrão rítmico
CENAS = [
    ("intro", "A música eletrônica de pista tem uma árvore genealógica. Vamos subir por ela, galho por galho.", 118, "four"),
    ("disco", "A raiz é a disco, nos anos setenta: o bumbo marca todos os tempos. É o famoso quatro por quatro.", 118, "four"),
    ("house", "Em Chicago, nos anos oitenta, DJs recriam esse groove com máquinas. Nasce o house, a cento e vinte e quatro BPM.", 124, "four"),
    ("techno", "Em Detroit, o house fica frio e mecânico. É o techno: cru, repetitivo e hipnótico.", 130, "four"),
    ("trance", "Na Alemanha dos anos noventa, o techno ganha melodias longas e épicas. Surge o trance.", 138, "four"),
    ("dnb", "No Reino Unido, os breakbeats aceleram até cento e setenta e quatro BPM. É o drum and bass.", 174, "break"),
    ("dubstep", "Do UK garage, primo do house, nasce o dubstep: meio tempo e graves pesados.", 140, "half"),
    ("outro", "Cada gênero é um galho da mesma raiz. Conhecer a árvore ajuda o DJ a montar sets com história.", 124, "four"),
]


def reamostrar(dados: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR:
        return dados
    t_orig = np.arange(len(dados)) / sr
    t_novo = np.arange(int(len(dados) * SR / sr)) / SR
    return np.interp(t_novo, t_orig, dados).astype(np.float32)


def ler_wav(caminho: Path) -> np.ndarray:
    with wave.open(str(caminho)) as w:
        sr = w.getframerate()
        dados = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if sr != SR:  # reamostragem linear simples
        t_orig = np.arange(len(dados)) / sr
        t_novo = np.arange(int(len(dados) * SR / sr)) / SR
        dados = np.interp(t_novo, t_orig, dados).astype(np.float32)
    return dados


def salvar_wav(caminho: Path, dados: np.ndarray) -> None:
    dados = np.clip(dados, -1, 1)
    with wave.open(str(caminho), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((dados * 32767).astype(np.int16).tobytes())


def bumbo() -> np.ndarray:
    t = np.arange(int(0.35 * SR)) / SR
    freq = 45 + 110 * np.exp(-t * 28)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    return (np.sin(fase) * np.exp(-t * 9)).astype(np.float32)


def caixa(rng) -> np.ndarray:
    t = np.arange(int(0.18 * SR)) / SR
    ruido = rng.uniform(-1, 1, len(t)) * np.exp(-t * 22)
    tom = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (0.5 * ruido + 0.4 * tom).astype(np.float32)


def chimbal(rng) -> np.ndarray:
    t = np.arange(int(0.05 * SR)) / SR
    ruido = rng.uniform(-1, 1, len(t))
    ruido = np.diff(ruido, prepend=0)  # passa-altas grosseiro
    return (ruido * np.exp(-t * 90) * 0.35).astype(np.float32)


def colar(destino: np.ndarray, som: np.ndarray, inicio_s: float, ganho: float, fim: int) -> None:
    i = int(inicio_s * SR)
    if i >= fim:
        return
    j = min(i + len(som), fim, len(destino))
    destino[i:j] += som[: j - i] * ganho


def batida(trilha, ini, fim, bpm, padrao, rng):
    k, s, h = bumbo(), caixa(rng), chimbal(rng)
    batida_s = 60 / bpm
    lim = int(fim * SR)
    n = int((fim - ini) / batida_s) + 1
    for b in range(n):
        t = ini + b * batida_s
        if padrao == "four":
            colar(trilha, k, t, 0.9, lim)
            colar(trilha, h, t + batida_s / 2, 0.8, lim)
            if b % 2 == 1:
                colar(trilha, s, t, 0.35, lim)
        elif padrao == "break":  # bumbo 1 e 2.5 (+), caixa em 2 e 4
            pos = b % 4
            if pos in (0, 2):
                colar(trilha, k, t, 0.9, lim)
            if pos == 1:
                colar(trilha, k, t + batida_s / 2, 0.7, lim)
            if pos in (1, 3):
                colar(trilha, s, t, 0.55, lim)
            colar(trilha, h, t, 0.5, lim)
            colar(trilha, h, t + batida_s / 2, 0.5, lim)
        elif padrao == "half":  # bumbo no 1, caixa no 3 (meio tempo)
            pos = b % 4
            if pos == 0:
                colar(trilha, k, t, 1.0, lim)
            if pos == 2:
                colar(trilha, s, t, 0.6, lim)
            colar(trilha, h, t + batida_s / 2, 0.45, lim)
            # sub grave ondulando (wobble)
            if pos == 0:
                dur = batida_s * 2
                tt = np.arange(int(dur * SR)) / SR
                wob = 0.5 + 0.5 * np.sin(2 * np.pi * (bpm / 60) * tt)
                sub = np.sin(2 * np.pi * 55 * tt) * wob * np.exp(-tt * 0.8)
                colar(trilha, sub.astype(np.float32), t, 0.35, lim)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--motor", choices=["omnivoice", "kokoro"], default="omnivoice")
    ap.add_argument("--modelo")
    ap.add_argument("--vozes")
    ap.add_argument("--voz", default="pm_alex")
    ap.add_argument("--velocidade", type=float, default=1.05)
    args = ap.parse_args()

    raiz = Path(__file__).resolve().parent.parent
    publico = raiz / "public"
    publico.mkdir(exist_ok=True)

    falas = []
    if args.motor == "kokoro":
        from kokoro_onnx import Kokoro

        kokoro = Kokoro(args.modelo, args.vozes)
        for cid, texto, _, _ in CENAS:
            audio, sr = kokoro.create(texto, voice=args.voz, speed=args.velocidade, lang="pt-br")
            falas.append(reamostrar(np.asarray(audio, dtype=np.float32), sr))
    else:
        import torch
        from omnivoice import OmniVoice

        modelo = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
        ref = str(Path(__file__).resolve().parent / "referencia-voz.wav")
        prompt = modelo.create_voice_clone_prompt(ref_audio=ref, ref_text=REF_TEXTO) if hasattr(modelo, "create_voice_clone_prompt") else None
        for cid, texto, _, _ in CENAS:
            extra = {"voice_clone_prompt": prompt} if prompt is not None else {"ref_audio": ref, "ref_text": REF_TEXTO}
            audio = modelo.generate(text=texto, language="pt", speed=args.velocidade, **extra)[0]
            falas.append(reamostrar(np.asarray(audio, dtype=np.float32), 24000))
            print(f"  voz pronta: {cid}", flush=True)

    cenas = []
    t = INICIO
    for (cid, texto, bpm, padrao), fala in zip(CENAS, falas):
        dur = len(fala) / SR
        cenas.append({"id": cid, "texto": texto, "bpm": bpm, "padrao": padrao, "falaInicio": round(t, 3), "falaFim": round(t + dur, 3)})
        t += dur + PAUSA
    total = t - PAUSA + FINAL

    # limites das cenas: cada cena começa um pouco antes da sua fala
    for i, c in enumerate(cenas):
        c["inicio"] = 0 if i == 0 else round(c["falaInicio"] - 0.25, 3)
    for i, c in enumerate(cenas):
        c["fim"] = cenas[i + 1]["inicio"] if i + 1 < len(cenas) else round(total, 3)

    n = int(total * SR) + 1
    voz = np.zeros(n, np.float32)
    for c, fala in zip(cenas, falas):
        i = int(c["falaInicio"] * SR)
        voz[i : i + len(fala)] += fala
    pico = np.max(np.abs(voz))
    voz = voz / pico * 0.9

    rng = np.random.default_rng(7)
    trilha = np.zeros(n, np.float32)
    for c in cenas:
        batida(trilha, c["inicio"], c["fim"], c["bpm"], c["padrao"], rng)
    trilha = trilha / np.max(np.abs(trilha)) * 0.9
    # fade in / out da trilha
    f = int(1.0 * SR)
    trilha[:f] *= np.linspace(0, 1, f)
    trilha[-f * 2 :] *= np.linspace(1, 0, f * 2)

    salvar_wav(publico / "narracao.wav", voz)
    salvar_wav(publico / "trilha.wav", trilha)

    (raiz / "src" / "tempos.json").write_text(
        json.dumps({"duracao": round(total, 3), "cenas": cenas}, ensure_ascii=False, indent=2)
    )
    print(f"duração total: {total:.2f}s")
    for c in cenas:
        print(f"{c['id']:8s} {c['inicio']:6.2f} → {c['fim']:6.2f}  fala {c['falaFim'] - c['falaInicio']:.2f}s")


if __name__ == "__main__":
    main()
