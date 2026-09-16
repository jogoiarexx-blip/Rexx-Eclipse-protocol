# REXX: ECLIPSE PROTOCOL — v1.2.2

**v1.2.1:** demônio com 5.000 HP. Visual procedural animado em Canvas, sem sprite sheet própria.

**Balanceamento atual:** minichefe aos 10:00; chefe + dois minichefes aos 15:00. Fácil não concede moedas permanentes e possui o evento secreto do demônio. Detalhes em `ATUALIZACAO-1.2.0.md`.

**Assets preservados:** todos os sprites raster em WebP; seis agentes com oito poses direcionais e animação JavaScript. Abra `PREVIA-AGENTES.html` para conferir. Detalhes e limites em `ATUALIZACAO-1.1.0.md`. Os registros das versões anteriores abaixo descrevem o histórico, não o formato atual dos arquivos.

Survivor / bullet heaven original em HTML5, CSS e JavaScript, com Canvas 2D. Todo o jogo roda no cliente, sem backend, conta, API, anúncio ou download de assets em tempo de execução.

## Jogar

1. Extraia o ZIP inteiro mantendo as pastas.
2. Abra **index.html** em um navegador de desktop com JavaScript habilitado.
3. Clique em **INICIAR PROTOCOLO**, selecione o agente, a região e a intensidade disponíveis e clique em **ENTRAR NA FENDA**.

O projeto utiliza scripts locais com `defer`, em ordem explícita, em vez de imports ES Modules ou `fetch`, para permitir execução direta via `file://`. Nenhuma instalação é necessária para jogar.

Para hospedar no GitHub Pages, coloque `index.html`, `css`, `js` e `assets` na raiz publicada, mantendo seus nomes. Não há etapa de build. O conteúdo também pode ser servido por qualquer hospedagem estática.

## Controles

| Ação | Controle |
|---|---|
| Mover | WASD ou setas |
| Pausar / continuar | ESC ou botão PAUSA |
| Escolher upgrades e operar menus | Mouse |
| Movimento opcional no gamepad | Analógico esquerdo |
| Pausa no gamepad | Start |
| Ataques e habilidade do agente | Automáticos |

Os menus do gamepad continuam usando mouse. A interface se adapta a resoluções menores, mas o jogo foi projetado para PC; não há joystick virtual para toque.

## O protocolo

Uma tempestade dimensional destruiu as barreiras entre realidades. Agentes equipados com um Eclipse Core entram em regiões contaminadas para transformar a energia das criaturas em armas e encerrar o sinal da entidade regional.

Cada missão tem uma fase de sobrevivência de **30 minutos**, seguida da batalha contra o chefe final. O relógio continua durante essa batalha; a vitória só ocorre quando a entidade final morre. Minichefes aparecem em 10 e 20 minutos; aos 15 minutos, uma caçada especial de quatro elites entra no campo. Eventos menores, elites e perigos ambientais acontecem durante toda a missão.

Colete fragmentos para subir de nível. Escolha entre três upgrades. Você dispõe de **6 espaços de armas e 6 espaços de passivas**. As armas vão até o nível 8; passivas, até o nível 5. Quando arma e passiva estão completas, continuam disponíveis recompensas de cura e moedas nos níveis adicionais.

Para evoluir: **arma no nível 8 + a passiva compatível em qualquer nível + abrir um baú**. O arsenal mostra todas as receitas e registra as descobertas. Uma abertura pode conceder evolução, melhorias adicionais e moedas.

Os três retransmissores azuis no radar são objetivos opcionais: fique perto deles durante 12 segundos acumulados para receber moedas e um baú. Dourado indica baús; vermelho, chefes; verde, o agente.

## Conteúdo

- 6 agentes com atributos, silhuetas e habilidades automáticas diferentes.
- 15 armas, oito níveis por arma, e 15 evoluções com alterações de comportamento.
- 14 passivas e cinco raridades ponderadas pela sorte.
- 22 inimigos comuns, elites e 5 chefes com fases e padrões de ataque.
- 5 regiões, com identidade procedural e perigos distintos.
- Normal, Difícil, Pesadelo e Eclipse.
- XP de quatro faixas visuais; cura, moedas, ímã, bomba, baú e energia especial.
- Queimadura, choque, congelamento, lentidão, veneno, vulnerabilidade e atordoamento.
- Progressão permanente, 33 conquistas, bestiário, arsenal, estatísticas e recordes.
- HUD, radar, pausa, level up, animação de baú, vitória e derrota.
- Música e efeitos originais sintetizados por Web Audio, com controles de volume separados.

Os seis agentes, os inimigos das cinco regiões e os cinco chefes usam sprites PNG animados originais. Decoração adicional, itens, armas e efeitos continuam procedurais, feitos com Canvas e CSS. Abra assets/images/enemies/preview.html para consultar as novas folhas animadas. Veja SPRITES.md para o estado exato da atualização. A trilha sintetizada evita arquivos grandes e dependências de codecs. As pastas de assets documentam onde acrescentar WebP, spritesheets ou faixas de áudio futuramente; a versão entregue não depende dessas substituições.

## Desbloqueios

| Conteúdo | Condição |
|---|---|
| Nyra Flux | 250 eliminações acumuladas |
| Brakk Ferrol | Sobreviver 10 minutos |
| Suri Rastro | Sobreviver 15 minutos |
| Ilya Boreal | Derrotar 2 chefes |
| NUL-7 | Vencer no Abismo |
| Região seguinte | Vencer na região anterior |
| Difícil / Pesadelo / Eclipse | 1 / 3 / 5 vitórias acumuladas |
| Trilho Magnético | 250 eliminações acumuladas |
| Arco de Retorno | 1.500 eliminações acumuladas |
| Sino do Eclipse | 10.000 eliminações acumuladas |
| Módulos permanentes de sorte, área e cooldown | 100 eliminações acumuladas |

As condições são atualizadas ao encerrar a missão. Reiniciar ou sair pelo menu de pausa encerra a tentativa como derrota e credita o que foi conquistado até ali.

## Salvamento

`localStorage` guarda moedas, aprimoramentos, descobertas, conquistas, configurações, estatísticas e recordes no navegador. Um save inválido é tratado e não impede a inicialização. Se o navegador impedir a escrita, o jogo exibe um aviso.

Em Configurações, use **Exportar perfil de segurança** e **Importar perfil JSON** para transportar seu progresso. A importação substitui o perfil atual. O progresso pertence à origem/endereço usado: abrir uma cópia em outra pasta ou mudar para GitHub Pages pode criar outro perfil.

A missão em andamento não é retomada após fechar ou recarregar a página. Para guardar suas recompensas, encerre pelo menu de pausa; o salvamento persistente cobre a progressão fora da missão.

## Qualidade e validação

Veja **TESTES.md** para os testes executados e seus limites. Houve validação de sintaxe, execução dos sistemas em DOM + Canvas e simulação acelerada de uma missão inteira, além de um cenário de 520 inimigos.

A inspeção interativa final em navegador real ficou impedida pelo ambiente de execução. O jogo inclui uma suíte Playwright para reproduzi-la localmente. Os testes automatizados não substituem playtests humanos de dificuldade, validação de áudio ou medições de FPS no seu computador.

## Desenvolvimento

Leia **ARQUITETURA.md** para os pontos de extensão. Não é preciso instalar as dependências de desenvolvimento para jogar. Para executar os testes opcionais, instale as dependências listadas em `package.json`.

## Pisos — v1.0.6

As cinco regiões agora usam texturas PNG próprias em `assets/images/ground/`. O módulo `js/core/ground.js` prepara um padrão espelhado em cache por região e desenha o piso antes dos objetivos, perigos e entidades. Se a imagem falhar, o piso procedural continua disponível. Abra `assets/images/ground/preview.html` para consultar os pisos. Detalhes e prompts nessa mesma pasta.

## Decoração regional — v1.0.6

20 sprites de cenário foram integrados, quatro por mapa. Fontes, atlas, prompt e galeria em `assets/images/scenery/`. `js/core/scenery.js` desenha apenas as células próximas à câmera, com distribuição estável e cache por partida. São objetos decorativos atravessáveis; áreas iniciais e retransmissores ficam livres. Itens, armas e efeitos continuam procedurais. A prévia dos pisos agora permite ligar e desligar a decoração.

## Itens e baús — v1.0.6

Os itens coletáveis agora usam 12 sprites em `assets/images/pickups/`: quatro classes de XP, cinco consumíveis e três estados do baú. O módulo `js/core/pickupSprites.js` renderiza os itens e a sequência de abertura; `css/pickups.css` controla a animação e respeita movimento reduzido. Galeria e prompt na mesma pasta. Armas e efeitos de combate continuam procedurais.

## Arsenal visual — v1.0.6

15 sprites de armas-base integrados ao arsenal, HUD e escolhas de upgrade. Lâminas orbitais, drones, discos de íon e arcos de retorno também usam sprites no combate. Arquivos, atlas, galeria e prompt em `assets/images/weapons/`; renderizador em `js/core/weaponSprites.js`. Evoluções compartilham a arte-base; feixes, áreas e demais efeitos continuam procedurais.
