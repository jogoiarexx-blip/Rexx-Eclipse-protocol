# REXX: Eclipse Protocol — 1.2.0

## Duração e chefes

- 10:00: um minichefe do arquétipo regional.
- 15:00: chefe principal e exatamente dois acompanhantes do mesmo arquétipo e HP do minichefe das 10:00.
- Se o minichefe anterior ainda estiver vivo, ele é retirado sem recompensas quando o encontro final começa. Isso mantém a batalha final com três chefes.
- Os acompanhantes não concedem moeda, baú, XP ou contagem de chefe; suas eliminações ainda contam como eliminações comuns. O chefe principal concede seu prêmio uma única vez fora do Fácil.
- Não há outro chefe agendado aos 20 ou 30 minutos. A batalha começa aos 15 minutos e continua até uma condição de vitória ou derrota; não há encerramento forçado no segundo 900.

## Dificuldades

Configuração central: `js/data/difficulties.js`. Fácil conserva HP, dano, velocidade, quantidade, ritmo de spawn e XP do antigo Normal. Normal tem valores provisórios moderadamente maiores (HP 1,15×, dano 1,10×, velocidade 1,04× e quantidade 1,06×). Difícil/Pesadelo e a opção extra Eclipse conservam os multiplicadores anteriores. Fácil e Normal estão disponíveis desde o início.

O Fácil não cria pickups de moeda e bloqueia moedas provenientes de coleta, chefes, baús, objetivos, upgrades, recompensa final e conquistas. Conquistas continuam desbloqueando, mas se concluídas no Fácil seu prêmio em moedas é zero e não é pago posteriormente. XP, armas, passivas, evoluções e desbloqueios continuam funcionando. Moedas e melhorias já existentes no save são preservadas.

## Evento secreto do Fácil

Após a morte do chefe principal, a partida entra numa transição de 2,5 segundos, com portal, escurecimento, som sintetizado de ameaça e tremor. O Caçador da Fenda (`NOOB_PUNISHER_DEMON`) só surge com dificuldade `easy` e `bossFinalDefeated` verdadeiro.

- Exatamente 1000 HP, sem multiplicadores de mapa ou dificuldade.
- 100 HP por acerto, ignorando armadura/resistência; escudo, dash e invencibilidade temporária continuam protegendo o jogador.
- Velocidade de 135% da velocidade-base do agente escolhido, antes dos upgrades permanentes.
- Perseguição direta, sem teleporte, fuga, sorteio de direção ou novas hordas do diretor depois da morte do chefe final.
- Proteção inicial de 0,8 segundo, limite de 125 HP por impacto recebido e intervalo de 0,08 segundo entre impactos. Isso evita eliminação instantânea por um único tiro. Não aumenta seus 1000 HP.
- Imune a controle de movimento para manter a perseguição.

O demônio usa desenho procedural original com estados de repouso, corrida, ataque, dano, risada e morte. É a implementação provisória permitida no pedido; não foi removido ou substituído nenhum sprite existente.

Se o demônio causar o golpe fatal, o agente cai, o demônio ri e aparece “VOCÊ É UM NOOB!” / “Volte e tente em uma dificuldade maior.”. Após quatro segundos surgem Tentar novamente, Selecionar dificuldade e Menu principal. Selecionar dificuldade abre a seleção em Normal. Outras fontes de dano ainda causam o Game Over normal.

Matar o demônio reproduz uma curta animação de morte e conclui a fase com vitória verdadeira, ainda sem moedas permanentes. As outras dificuldades concluem normalmente ao derrotar o chefe principal.

## Save, pausa e assets

A chave e versão principal do save não mudaram. `difficultySchema: 2` identifica a alteração de nomes. Recordes antigos de Normal são movidos para Fácil uma única vez. Saldo, melhorias, descobertas, conquistas, estatísticas e recordes das outras dificuldades permanecem.

Pausa por ESC, perda de foco e aba oculta também congelam as sequências especiais. Reiniciar cria um novo estado de evento. Finalização tem proteção contra contagem ou pagamento duplicado.

Todos os WebP, poses direcionais e galerias da 1.1.0 foram preservados. O jogo continua offline e compatível com a estrutura de GitHub Pages.

## Testes

32 grupos automatizados: 16 regressões anteriores e 16 grupos novos em `tests/balance-scenarios.js`, além da validação dos sprites. Incluem os horários, composição do encontro, capacidade do pool, moedas, XP, dano exato, HP, velocidade, perseguição, proteção contra morte instantânea, sequência especial, botões, vitória, ausência de demônio nas outras dificuldades, pausa/reinício e migração de save.

Relatório: `tests/results/sprite-results-v1.2.0.json`. Ambiente: JSDOM + Canvas nativo. Portal, perseguição e cena da risada foram inspecionados visualmente. Zero erros capturados nesse ambiente. Validação em navegador real é registrada separadamente quando disponível.
