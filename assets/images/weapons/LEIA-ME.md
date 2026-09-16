# Arsenal visual — v1.0.6

15 armas-base originais na folha RGBA `weapons.png`, 1536 × 1024. PNG preservado sem edição. Atlas de retângulos reais em `atlas.json` e `atlas-data.js`, sem assumir células rígidas. Criado pela ferramenta integrada de geração de imagens; prompt completo em `PROMPT.txt`.

`js/core/weaponSprites.js` fornece desenho Canvas e ícones de interface com cache. Aplicação: arsenal, HUD, opções de upgrade; lâminas orbitais, drones, discos de íon e arcos de retorno no combate. Discos/arcos giram pelo tempo do projétil. Projéteis inimigos mantêm a representação anterior. Os sprites não alteram tamanho de colisão, dano, cadência ou desbloqueios.

As demais armas recebem ícones de interface; seus feixes, áreas, explosões, minas e partículas continuam procedurais. Evoluções mantêm a arte-base e os efeitos existentes, sem sprites exclusivos nesta entrega. Há fallback para ícones/desenhos anteriores enquanto a folha carrega ou caso falhe.

Abra `preview.html` para conferir todas as armas.
