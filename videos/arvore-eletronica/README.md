# A Árvore Genealógica da Música Eletrônica

Motion graphic de ~54s (1920x1080, 30fps) feito com Remotion.

- `scripts/gerar_audio.py`: gera a narração (Piper TTS, voz pt-BR), a batida de fundo
  (o BPM muda conforme o gênero) e o arquivo `src/tempos.json` que sincroniza as cenas com a fala.
- `src/dados.ts`: gêneros, cores, posições na árvore, BPM e características.
- `src/Arvore.tsx`: árvore com ramos crescendo, câmera que segue cada galho e nós pulsando no BPM.
- `src/Painel.tsx`: cartão de cada gênero com tipografia cinética.
- `src/Legenda.tsx`: legenda sincronizada com a narração.

## Comandos

```bash
npm i
npx remotion studio                       # pré-visualizar
npx remotion render src/index.ts ArvoreEletronica out/arvore-eletronica.mp4
```

Para trocar o texto da narração, edite `CENAS` em `scripts/gerar_audio.py` e rode:

```bash
python3 scripts/gerar_audio.py --piper <caminho/do/piper> --voz <voz-pt-br.onnx>
```
