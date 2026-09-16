> Atualização vigente: v1.1.0. Imagens raster convertidas para WebP; PNGs e rascunhos não acompanham o pacote. Agentes agora usam oito poses direcionais com animação JavaScript. Consulte ATUALIZACAO-1.1.0.md na raiz. As seções anteriores abaixo são históricas.

# Assets

`images/zone-zero/agents-walk.png`: 24 quadros dos seis agentes, com alfa verdadeiro.

`images/enemies/`: cinco folhas regionais e uma de chefes, 260 quadros transparentes, atlas JSON/JavaScript, prompts e prévia animada offline (`preview.html`). O renderizador seleciona a variante do mapa atual.

Decoração adicional, itens, armas e efeitos usam Canvas/CSS. O áudio é sintetizado via Web Audio. `ui/core.svg` é o ícone original. Veja `../SPRITES.md` para detalhes e limites.

## Pisos — v1.0.3

As cinco regiões agora usam texturas PNG próprias em `assets/images/ground/`. O módulo `js/core/ground.js` prepara um padrão espelhado em cache por região e desenha o piso antes dos objetivos, perigos e entidades. Se a imagem falhar, o piso procedural continua disponível. Abra `assets/images/ground/preview.html` para consultar os pisos. Detalhes e prompts nessa mesma pasta.

## Decoração regional — v1.0.4

20 sprites de cenário foram integrados, quatro por mapa. Fontes, atlas, prompt e galeria em `assets/images/scenery/`. `js/core/scenery.js` desenha apenas as células próximas à câmera, com distribuição estável e cache por partida. São objetos decorativos atravessáveis; áreas iniciais e retransmissores ficam livres. Itens, armas e efeitos continuam procedurais. A prévia dos pisos agora permite ligar e desligar a decoração.

## Itens e baús — v1.0.5

Os itens coletáveis agora usam 12 sprites em `assets/images/pickups/`: quatro classes de XP, cinco consumíveis e três estados do baú. O módulo `js/core/pickupSprites.js` renderiza os itens e a sequência de abertura; `css/pickups.css` controla a animação e respeita movimento reduzido. Galeria e prompt na mesma pasta. Armas e efeitos de combate continuam procedurais.

## Arsenal visual — v1.0.6

15 sprites de armas-base integrados ao arsenal, HUD e escolhas de upgrade. Lâminas orbitais, drones, discos de íon e arcos de retorno também usam sprites no combate. Arquivos, atlas, galeria e prompt em `assets/images/weapons/`; renderizador em `js/core/weaponSprites.js`. Evoluções compartilham a arte-base; feixes, áreas e demais efeitos continuam procedurais.
