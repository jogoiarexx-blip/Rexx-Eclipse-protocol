# REXX: Eclipse Protocol — v1.1.0

## WebP

Todos os 16 arquivos raster usados pelo jogo agora são WebP: agentes, inimigos, chefes, pisos, decoração, itens e armas. PNGs de trabalho e rascunhos não são incluídos neste ZIP. O ícone vetorial SVG permanece vetorial.

- Imagens antes da conversão, incluindo a nova folha direcional: 39.864.460 bytes.
- Imagens WebP: 17.904.948 bytes.
- Redução: 55,1% no tamanho desses arquivos.
- Sprites: compressão sem perda, dimensões e canal alfa preservados.
- Pisos: compressão com perda, qualidade 82, dimensões preservadas.
- Relatório por arquivo: `assets/optimization.json`.

A redução é de download/armazenamento; WebP decodificado continua usando memória proporcional à resolução. Não representa uma medição de ganho de FPS.

## Direções e animação

Os seis agentes têm uma nova folha com 48 poses, oito direções por personagem: leste, sudeste, sul, sudoeste, oeste, noroeste, norte e nordeste. O renderizador escolhe a direção pelo vetor de movimento de WASD/setas/gamepad e mantém a última orientação ao parar. O corpo usa poses direcionais, não rotação da vista frontal.

Cada direção tem uma pose, animada por JavaScript com balanço e deslocamento vertical durante a caminhada e respiração em repouso. Não são oito sequências completas de passos desenhados quadro a quadro. A preferência de movimento reduzido desliga o balanço/respiração dos agentes. As poses geradas têm pequenas variações de silhueta e algumas diagonais são semelhantes.

Inimigos e chefes mantêm suas sequências de quatro quadros. Baús mantêm três estados. Itens especiais oscilam; XP pulsa; lâminas orbitam; drones acompanham o agente; discos e arcos giram; ícones de armas no HUD pulsam. A iluminação da decoração varia suavemente. Pisos e estruturas não giram ou se deslocam. Evoluções continuam compartilhando a arte-base; efeitos de combate continuam procedurais.

## Conferir

- Jogo: extraia o ZIP e abra `index.html`.
- Direções e caminhada: abra `PREVIA-AGENTES.html`; escolha o agente, use WASD/setas ou os botões de direção.
- Outras galerias: arquivos `preview.html` nas pastas de assets.

## Validação

Passaram a decodificação dos WebP, preservação do alfa, carregamento dos atlas, seis agentes × oito direções, controles diagonais, manutenção da direção em repouso, orientação por gamepad e 16 grupos de regressão. As 48 poses renderizadas foram inspecionadas. Resultado em `tests/results/sprite-results-v1.1.0.json`.

Ambiente dos testes: JSDOM + Canvas nativo. Não houve sessão de validação em navegador real nem medição de FPS no computador de um jogador.
