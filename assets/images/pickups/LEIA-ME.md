# Itens e baús — v1.0.5

Folha RGBA original `items.png`, 1536 × 1024, com 12 sprites: quatro classes de XP, cura, moeda, ímã, bomba, energia e três estados do baú. Coordenadas reais em `atlas.json`/`atlas-data.js`. PNG preservado sem edição. Criado pela ferramenta integrada de geração de imagens; prompt completo em `PROMPT.txt`.

`js/core/pickupSprites.js` escolhe o fragmento segundo o valor: 1–4 pequeno, 5–9 médio, 10–39 grande, 40+ especial. Os itens especiais têm uma oscilação vertical leve. Tamanhos de exibição ficam no atlas e não alteram a área de coleta.

A tela de recompensas usa três quadros de abertura em 0,9 segundo via CSS, sem timer de gameplay. O botão permite continuar imediatamente. A preferência do sistema por movimento reduzido mostra o baú aberto. Existem pequenas variações de perspectiva entre os quadros gerados.

Os efeitos dos itens, probabilidades, recompensas, evoluções e salvamento mantêm as regras existentes. Se a folha não carregar, a representação procedural anterior continua disponível.

Abra `preview.html` para consultar os sprites e repetir a abertura.
