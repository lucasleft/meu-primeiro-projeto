# Regras do projeto

## Economia de tokens (sempre)
- Responda direto, sem introdução nem resumo final. Padrão: 1 a 5 linhas.
- Junte chamadas de ferramenta independentes num único passo.
- Leia só os arquivos necessários; edite trechos, nunca reescreva arquivos inteiros.
- Pesquisa na web só para fatos atuais; no máximo 1–2 buscas em modo standard.
- Não verifique o próprio trabalho relendo arquivos, salvo se pedido.
- Não pergunte: assuma a leitura mais razoável e diga a suposição em uma linha.

## Plugins e ferramentas: use sempre que couber
- **ponytail**: todo código. Menor solução que funciona, stdlib primeiro, nada não pedido.
- **agent-reach** (CLI `agent-reach`): ler/buscar X, Reddit, YouTube, Bilibili, Xiaohongshu, GitHub, V2EX, LinkedIn, Instagram etc. quando as ferramentas web padrão falharem ou não alcançarem.
- **skillspector** (CLI): escanear qualquer skill/plugin/MCP antes de instalar: `skillspector scan <caminho ou URL> --no-llm`.
- **lemo-opuscar**: vídeos/filmes feitos em código com estilos prontos.
- **remotion**: vídeos programáticos em React.
- **FreeLLMAPI** (`~/freellmapi`, porta 3001): endpoint OpenAI-compatível `/v1` para usar LLMs gratuitos em scripts. Iniciar: `cd ~/freellmapi && node server/dist/index.js`.
- Plugins `ecc` e `huggingface-skills` estão desativados neste projeto para economizar ~42 mil tokens por sessão. Reative em `.claude/settings.json` só se a tarefa precisar.

## Modelos
- Tarefas complexas: modelo principal (Opus) com esforço alto.
- Subagentes de busca/leitura: prefira `model: "haiku"` ou `"sonnet"`.
