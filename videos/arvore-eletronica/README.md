# A Árvore Genealógica da Música Eletrônica

Motion graphic de ~49s feito com Remotion, em duas versões: Reel vertical (1080x1920) e horizontal (1920x1080).

- `scripts/gerar_audio.py`: gera a narração (OmniVoice, o modelo do VoiceStudio, clonando `scripts/referencia-voz.wav`; ou Kokoro), a batida de fundo
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
pip install torch torchaudio omnivoice soundfile numpy
python3 scripts/gerar_audio.py --motor omnivoice
```

As instruções do motor Kokoro estão no topo do script.

> Licença: os pesos do OmniVoice são CC-BY-NC (uso não comercial). Para uso comercial, gere a voz com o Kokoro (Apache-2.0).
