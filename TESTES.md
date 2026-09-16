# Relatório de validação — 15/09/2026

## Executado

- Verificação sintática dos módulos JavaScript usando `node --check`.
- Validação de referências locais no HTML e integridade do ZIP.
- Execução real dos sistemas JavaScript em JSDOM, com Canvas nativo.
- Inspeção de renderização do campo de batalha com o renderizador Canvas original.
- Simulação acelerada de uma missão completa e um cenário de estresse com 520 inimigos.

## Regressões

| Grupo | Resultado |
|---|---|
| Content counts | PASSOU |
| Movement, diagonal normalization, boundaries and pause | PASSOU |
| Spatial hash and pool reuse | PASSOU |
| Damage, armor, resistance, invincibility and death | PASSOU |
| XP collection, queued levels and all upgrade card actions | PASSOU |
| Every weapon base and evolution causes damage | PASSOU |
| All 15 evolution recipes require max level and passive | PASSOU |
| Seven statuses and DOT | PASSOU |
| All drops, chest queue and reward UI | PASSOU |
| Five bosses: attacks, phases, final victory and map unlock | PASSOU |
| Boss spawns even with pool at capacity | PASSOU |
| Wave milestones and environmental mechanisms | PASSOU |
| Retransmitter objective grants chest and coins | PASSOU |
| Save roundtrip and corrupted JSON fallback | PASSOU |
| Menu renderers, settings and restart | PASSOU |
| Stress: 520 enemies, six evolved weapons and bounded pools | PASSOU |

O grupo de armas verifica dano para cada uma das 15 armas básicas e suas 15 formas evoluídas. As receitas são verificadas com e sem os pré-requisitos. O teste de carga mantém 520 inimigos ativos com seis armas evoluídas, processa 300 passos de simulação e invoca a renderização em intervalos regulares.

## Missão acelerada

O coletor automático usa invulnerabilidade **somente na suíte de testes** para percorrer toda a programação do diretor. Essa opção não é ativada nem exposta pelo jogo normal. As escolhas de upgrades continuam aleatórias, portanto cada execução pode produzir uma build diferente.

- Duração percorrida: 1809.47 segundos.
- Atualizações: 54,286.
- Nível final: 80.
- Inimigos eliminados: 11,217.
- Chefes eliminados: 3.
- Evoluções: 2.
- Pico nesta missão: 194 inimigos, 104 projéteis e 430 drops.
- Evento do chefe final confirmado; encerramento com vitória e crédito de recompensas confirmado.

A duração de execução da simulação não mede FPS de navegador: ela omite a maioria das renderizações e não mede composição CSS, áudio ou a GPU do computador do jogador.

## Limitações de validação

**A suíte de navegador real não foi executada.** O ambiente não disponibilizou um navegador local utilizável e o navegador remoto bloqueou o acesso ao endereço local do projeto. Não se afirma, portanto, que houve inspeção completa do console, layout responsivo, áudio, gamepad, tela cheia ou execução por `file://` em Chrome/Firefox/Edge.

Os módulos passaram por validação sintática e execução de lógica/DOM/Canvas sem falhas nos grupos acima. Isso não equivale a garantir ausência de qualquer bug nem a substituir playtests humanos de balanceamento de 30 minutos.

## Reproduzir

Para jogar, não instale nada. Para desenvolver e testar, use Node compatível com o `package.json`:

```sh
npm install
npm test
npm run test:soak
npx playwright install chromium
npm run test:browser
```

A suíte de navegador abre o `index.html` pelo disco, verifica erros de página e executa as regressões compartilhadas. `CHROMIUM_PATH` pode apontar para um executável local. `SCREENSHOTS` pode indicar uma pasta existente para imagens de diagnóstico.

Validação manual recomendada antes de uma publicação pública:

1. Jogar com teclado, verificar visibilidade do agente e legibilidade dos sinais de perigo.
2. Experimentar layouts 1920×1080, 1366×768 e 1280×720.
3. Conferir música, SFX, controles de volume, tela cheia e gamepad.
4. Fechar/reabrir o navegador e importar/exportar um perfil de teste.
5. Completar partidas sem invulnerabilidade para avaliar progressão, dificuldade e variedade de builds.

Os resultados brutos das execuções realizadas estão em `tests/results/`.

## Atualização 1.0.1 — sprites dos agentes

Executado `tests/sprite-tests.cjs` com o atlas real: carregamento, dimensões, transparência, conteúdo nas 24 células, diferença entre quadros de caminhada, movimento/parada e seis retratos de menu passaram. Os 16 grupos de regressão também passaram com os sprites carregados.

Foi inspecionada uma renderização do campo com o sprite do Rexx. O teste usa JSDOM e Canvas nativo, não um navegador real. A suíte contorna uma identificação incorreta do decoder de testes ao ignorar metadados auxiliares apenas durante a decodificação em memória; o PNG distribuído mantém seus pixels e metadados originais.

Resultado bruto: `tests/results/sprite-results.json`. Reproduzir com `npm run test:sprites` após instalar as dependências opcionais de desenvolvimento.

## Atualização 1.0.2 — inimigos e chefes por região

A suíte `tests/sprite-tests.cjs` passou com as seis novas folhas: 260 retângulos válidos, todas as cinco regiões associadas corretamente, cinco chefes encontrados, transparência e desenho Canvas. Agentes, retratos e os 16 grupos de regressão também passaram.

Resultado: `tests/results/sprite-results-v1.0.2.json`. Uma renderização do campo foi inspecionada visualmente. Ambiente JSDOM + Canvas nativo; não houve teste visual em navegador real ou medição de FPS em hardware de jogador. Os PNGs distribuídos são os originais; o contorno do decoder descrito acima ocorre apenas em memória nos testes.

## Atualização 1.0.3 — pisos

Passaram carregamento das cinco texturas, igualdade de pixels nas bordas horizontais/verticais dos padrões espelhados, desenho de todos os mapas e retorno de fallback para recurso ausente. Os 16 grupos de regressão e testes dos sprites anteriores passaram. Resultado: `tests/results/sprite-results-v1.0.3.json`. Renderizações das cinco regiões foram inspecionadas em Canvas nativo. O teste continua usando JSDOM; não representa uma sessão em navegador real nem medição de FPS.

## Atualização 1.0.4 — decoração regional

Passaram o carregamento da folha, limites dos 20 sprites, distribuição determinística, exclusão das áreas dos retransmissores e desenho apenas das células visíveis. As cinco renderizações com decoração foram inspecionadas. Testes dos pisos, sprites anteriores e 16 grupos de regressão passaram. Resultado em `tests/results/sprite-results-v1.0.4.json`. Ambiente JSDOM + Canvas nativo; validação em navegador real e medição de desempenho em hardware de usuário permanecem pendentes.

## Atualização 1.0.5 — itens e baús

Passaram carregamento dos 12 sprites, seleção das quatro classes de XP, desenho dos seis tipos especiais (incluindo baú), retorno para tipo desconhecido, criação dos três quadros na tela de recompensas e retomada da partida. Os 16 grupos de regressão incluem coleta, efeitos, fila de baús e recompensas. Uma renderização com os dez itens coletáveis foi inspecionada em Canvas nativo. Resultado: `tests/results/sprite-results-v1.0.5.json`. A cadência visual da animação CSS não foi validada em navegador real; a suíte usa JSDOM + Canvas nativo.

## Atualização 1.0.6 — armas

Passaram carregamento e associação dos 15 sprites, desenho Canvas de todas as armas, 15 ícones no arsenal, ícone na opção de upgrade, desenho de discos/arcos e preservação do desenho de projéteis hostis. Os testes anteriores e 16 grupos de regressão passaram. Resultado em `tests/results/sprite-results-v1.0.6.json`. Ambiente JSDOM + Canvas nativo; ainda sem validação visual em navegador real.
