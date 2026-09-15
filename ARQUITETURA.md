# Arquitetura

## Carregamento e responsabilidades

O único namespace compartilhado é `window.Rexx`. A ordem de carregamento está explícita em `index.html`: configuração → dados → ferramentas da engine → entidades → sistemas → jogo → renderização → interface → inicialização. Isso mantém a compatibilidade com abertura direta pelo disco.

| Local | Responsabilidade |
|---|---|
| `js/config.js` | Limites do mundo, duração, capacidades e utilitários |
| `js/data/` | Catálogos de armas, agentes, inimigos, chefes, passivas, mapas e dificuldades |
| `js/core/engine.js` | Loop, redimensionamento e renderização Canvas |
| `js/core/pool.js` | Reutilização de entidades e limites de capacidade |
| `js/core/collision.js` | Spatial hash, com células de 96 unidades |
| `js/core/input.js` | Teclado, gamepad e perda de foco |
| `js/core/camera.js` | Interpolação, zoom de evento e tremor |
| `js/core/audio.js` | Música procedural e feedback sonoro via Web Audio |
| `js/core/save.js` | Defaults, validação, leitura, escrita e exportação do perfil |
| `js/entities/` | Estado e atualização de agente, inimigos, chefes, projéteis e drops |
| `js/systems/weaponSystem.js` | Cadência, escalonamento de arma e contexto de disparo |
| `js/systems/weaponBehaviors.js` | Estratégias independentes de cada tipo de ataque |
| `js/systems/enemySpawner.js` | Diretor de hordas, marcos, formações e perigos ambientais |
| `js/systems/upgradeSystem.js` | Sorteio, raridades, aplicação de níveis e evolução |
| `js/systems/levelSystem.js` | Curva de XP e fila de escolhas |
| `js/systems/damageSystem.js` | Crítico, mitigação, estados e atribuição de dano |
| `js/systems/particleSystem.js` | Partículas e números com pool e limite de emissão |
| `js/systems/achievementSystem.js` | Catálogo e concessão de 33 conquistas |
| `js/game.js` | Sessão, coordenação dos sistemas, áreas, recompensas e encerramento |
| `js/ui/` | Menus e telas funcionais, HUD e interação |
| `js/main.js` | Inicialização e serviços da aplicação |

## Estado da sessão

A partida usa `playing`, `paused`, `level`, `chest` e `ended`. Só `playing` avança a simulação. Escolhas múltiplas de nível e baús simultâneos entram em filas. O encerramento é idempotente, evitando recompensas duplicadas.

O loop usa requestAnimationFrame, limita pausas longas e subdivide atualizações em passos de no máximo 1/60 s. Posição e animação usam segundos, sem velocidade dependente da taxa de quadros. Perder o foco ou ocultar a aba pausa a partida.

## Desempenho

- Pools limitam 520 inimigos, 850 projéteis, 350 partículas e 650 drops.
- Quando o pool de XP enche, seu valor é agregado a um fragmento existente.
- Chefes reservam sua aparição mesmo quando o pool de inimigos está cheio.
- Spatial hash reduz as consultas locais de projéteis e áreas de dano.
- A aquisição de alvo usa busca linear apenas no momento do disparo, em vez de cada projétil comparar contra todos os inimigos a cada frame.
- Inimigos muito distantes são reposicionados; projéteis e zonas têm tempo de vida limitado.
- Objetos fora da câmera são descartados da renderização quando pertinente.
- HUD atualiza a 10 Hz; resolução interna e emissão de partículas respondem à qualidade gráfica.

Os limites preservam a continuidade da simulação em picos; disparos e partículas excedentes são descartados até haver espaço no pool. Isso é uma política de carga, não um limite visual de inimigos descobertos.

## Acrescentar conteúdo

**Arma:** acrescente uma entrada em `data/weapons.js`, com ID estável, tipo de comportamento, atributos e passiva de evolução. Reutilize uma estratégia existente ou acrescente uma função em `weaponBehaviors.js`. A interface lê o catálogo automaticamente.

**Passiva:** acrescente um registro em `data/upgrades.js` e a regra de aplicação em `Player.recalc` se for um atributo novo. Os atributos percentuais e absolutos devem ser distinguidos no texto exibido.

**Agente:** defina atributos, arma inicial, habilidade, descrição e condição de desbloqueio em `data/characters.js`. Implemente uma habilidade nova em `Game.special` e sua silhueta no renderizador.

**Inimigo:** adicione atributos e o tipo de comportamento em `data/enemies.js`. Os comportamentos são tratados em `entities/enemy.js`. Inclua seu índice nas populações dos mapas desejados.

**Mapa:** defina paleta, população, dificuldade e chefe em `data/maps.js`; implemente a decoração em `Engine.tile` e perigos em `Director.environment`. O desbloqueio sequencial considera a ordem do catálogo.

**Boss:** use ID estável, HP, dano, identidade e tipo em `data/enemies.js`; seus padrões ficam em `entities/boss.js`. Os estágios mudam aos limiares de 65% e 30% de HP.

**Arte:** `js/core/sprites.js` carrega os agentes; `js/core/enemySprites.js` usa `assets/images/enemies/atlas-data.js` para selecionar animações de inimigos por região e dos cinco chefes. Cenário, itens e efeitos são procedurais. Sprites WebP podem substituir `Engine.entity`, `Engine.player` e `Engine.tile` sem alterar a simulação. Pré-carregue recursos locais antes da primeira partida; preserve dimensões de colisão independentes da imagem.

**Áudio:** o sintetizador é funcional e autoral. Para substituir por faixas comprimidas, preserve a interface `init`, `play` e `update`, e as configurações de volume geral, música e efeitos.

## Evolução do save

Preserve IDs já publicados. Alterações incompatíveis de formato devem ganhar uma migração explícita e um novo número de versão. Não remova o tratamento de erro ou os valores padrão seguros em `Save.load`.
