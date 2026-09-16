# Decoração regional — v1.0.4

20 sprites estáticos originais, quatro por região, na folha RGBA `props.png` (1024 × 1536). Coordenadas reais em `atlas.json` e `atlas-data.js`. Abra `preview.html` para consultar os objetos ou `../ground/preview.html` para ver os cenários.

Método: ferramenta integrada de geração de imagens; prompt integral em `PROMPT.txt`. PNG preservado sem edição. O atlas usa os limites de transparência de cada objeto, não uma divisão rígida de células que cortaria partes dos sprites.

`js/core/scenery.js` mantém a distribuição determinística por região e caches por partida. Somente células na região visível são desenhadas. Há espaços livres em torno do início e dos retransmissores. A decoração é desenhada abaixo de perigos, itens e entidades e fica mais transparente perto do agente.

São elementos decorativos atravessáveis, não obstáculos físicos, objetos destrutíveis ou fontes de recompensa. Inimigos, movimentação, ataques e colisões mantêm as regras existentes.
