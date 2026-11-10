# A Árvore Genealógica da Música Eletrônica

Motion graphic de ~49s feito com Remotion, em duas versões: Reel vertical (1080x1920) e horizontal (1920x1080).

- `scripts/gerar_audio.py`: gera a narração (Kokoro TTS, voz pt-BR `pm_alex`), a batida de fundo
  (o BPM muda conforme o gênero) e o arquivo `src/tempos.json` que sincroniza as cenas com a fala.
- `src/dados.ts`: gêneros, cores, posições na árvore, BPM e características.
- `src/Arvore.tsx`: árvore com ramos crescendo, câmera que segue cada galho e nós pulsando no BPM.
- `src/Painel.tsx`: cartão de cada gênero com tipografia cinética.
- `src/Legenda.tsx`: legenda sincronizada com a narração.
- `src/layout.ts`: posições para cada formato (o Reel evita as áreas cobertas pela interface do Instagram).

## Comandos

```bash
npm i
npx remotion studio                       # pré-visualizar
npx remotion render src/index.ts ArvoreEletronicaReel out/arvore-eletronica-reel.mp4  # Reel 9:16
npx remotion render src/index.ts ArvoreEletronica out/arvore-eletronica.mp4           # 16:9
```

Para trocar o texto da narração, edite `CENAS` em `scripts/gerar_audio.py` e rode:

```bash
pip install kokoro-onnx soundfile numpy
# baixe kokoro-v1.0.onnx e voices-v1.0.bin nos releases de thewh1teagle/kokoro-onnx
python3 scripts/gerar_audio.py --modelo kokoro-v1.0.onnx --vozes voices-v1.0.bin --voz pm_alex  # ou pm_santa / pf_dora
```
