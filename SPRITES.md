# Sprites — atualização 1.0.2

## Integrados ao jogo

- Seis agentes: 24 quadros de caminhada, retratos, repouso e espelhamento horizontal.
- Cinco folhas regionais de inimigos: Zona Zero, Deserto de Vidro, Complexo Ômega, Floresta Corrompida e Abismo.
- Cada folha regional contém 12 sequências de quatro quadros: 240 quadros ao todo. São variantes regionais das 22 espécies do jogo, incluindo quatro variantes específicas de elites; não são 60 espécies diferentes.
- Uma folha dos cinco chefes: quatro quadros por chefe, totalizando 20 quadros.
- Total desta atualização: 260 quadros novos; 284 contando os agentes anteriores.
- PNGs originais com transparência verdadeira, carregados localmente. Renderização procedural de segurança se algum recurso não carregar.
- As elites sem sequência exclusiva usam o sprite da espécie com escala e efeitos de elite.

## Abrir e consultar

Abra `index.html` para jogar. Para conferir todas as novas sequências, abra `assets/images/enemies/preview.html`: escolha a região e ajuste a velocidade ou pause.

As seis pastas em `assets/images/enemies/` contêm PNG, atlas JSON e prompt de criação. O atlas raiz descreve os retângulos reais de cada quadro; não presuma células de tamanho fixo. `atlas-data.js` permite carregamento offline sem fetch.

`js/core/enemySprites.js` associa espécie, região e chefe aos quadros. `js/core/sprites.js` permanece responsável pelos agentes. A aparência é independente das colisões e dos atributos.

## Limites da arte

As folhas têm uma orientação frontal/sul em perspectiva superior. Não incluem oito direções ou sequências independentes de ataque e morte. Há pequenas variações de contorno entre quadros gerados. Ruínas adicionais, itens, armas e efeitos continuam procedurais. Portanto, esta entrega conclui as folhas regionais de inimigos e chefes, não todos os elementos visuais do cenário.

O arquivo `art-source/enemies-a-draft-not-integrated.png` é um rascunho histórico opaco, substituído pelas novas folhas e não usado pelo jogo.

## Produção e validação

Método: geração de imagens integrada, com prompts preservados junto das folhas, sem assets de outros jogos. PNGs preservados sem edição. Coordenadas extraídas por inspeção do canal alfa.

Validados: seis folhas, 260 retângulos, associação de todas as regiões e chefes, transparência e renderização Canvas. Os 16 grupos de regressão passaram. Ambiente: JSDOM + Canvas nativo; não foi uma sessão em navegador real. Veja `TESTES.md`.

## Pisos — v1.0.3

As cinco regiões agora usam texturas PNG próprias em `assets/images/ground/`. O módulo `js/core/ground.js` prepara um padrão espelhado em cache por região e desenha o piso antes dos objetivos, perigos e entidades. Se a imagem falhar, o piso procedural continua disponível. Abra `assets/images/ground/preview.html` para consultar os pisos. Detalhes e prompts nessa mesma pasta.

## Decoração regional — v1.0.4

20 sprites de cenário foram integrados, quatro por mapa. Fontes, atlas, prompt e galeria em `assets/images/scenery/`. `js/core/scenery.js` desenha apenas as células próximas à câmera, com distribuição estável e cache por partida. São objetos decorativos atravessáveis; áreas iniciais e retransmissores ficam livres. Itens, armas e efeitos continuam procedurais. A prévia dos pisos agora permite ligar e desligar a decoração.

## Itens e baús — v1.0.5

Os itens coletáveis agora usam 12 sprites em `assets/images/pickups/`: quatro classes de XP, cinco consumíveis e três estados do baú. O módulo `js/core/pickupSprites.js` renderiza os itens e a sequência de abertura; `css/pickups.css` controla a animação e respeita movimento reduzido. Galeria e prompt na mesma pasta. Armas e efeitos de combate continuam procedurais.

## Arsenal visual — v1.0.6

15 sprites de armas-base integrados ao arsenal, HUD e escolhas de upgrade. Lâminas orbitais, drones, discos de íon e arcos de retorno também usam sprites no combate. Arquivos, atlas, galeria e prompt em `assets/images/weapons/`; renderizador em `js/core/weaponSprites.js`. Evoluções compartilham a arte-base; feixes, áreas e demais efeitos continuam procedurais.
