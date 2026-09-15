# Sprites — atualização 1.0.1 (agentes)

## Aplicado ao jogo

- Rexx Vektor, Nyra Flux, Brakk Ferrol, Suri Rastro, Ilya Boreal e NUL-7.
- 24 quadros: quatro por agente, em uma folha PNG com canal alfa verdadeiro.
- Animação de caminhada a 8 quadros por segundo, acionada pelo movimento.
- Primeiro quadro quando o agente está parado.
- Espelhamento horizontal ao andar para a esquerda.
- Retratos reais nas telas de seleção e consulta de personagens.
- Carregamento local compatível com a estrutura offline existente.
- O desenho procedural continua disponível automaticamente se a imagem não carregar.
- Colisões, atributos, armas, progresso e desbloqueios mantêm as regras da versão anterior.

A folha contém uma única orientação frontal/sul. Ela **não** contém animações independentes para norte, leste e oeste, nem sequências desenhadas separadamente de ataque ou morte. Os efeitos de combate continuam sendo os procedurais do jogo.

## Arquivos

`assets/images/zone-zero/agents-walk.png`: 1024 × 1536, quatro colunas e seis linhas, células de 256 × 256.

`assets/images/zone-zero/atlas.json`: posições, personagens, tamanho das células e cadência.

`js/core/sprites.js`: carregamento e desenho dos quadros.

## Ainda NÃO concluído para a Zona Zero

| Grupo | Estado |
|---|---|
| 6 agentes | Sprites aplicados, com as limitações de orientação descritas acima |
| 12 tipos de inimigos da região | Continuam procedurais |
| Elites | Continuam procedurais |
| Arconte das Antenas e Leviatã de Sílica | Continuam procedurais |
| Terreno, ruínas, retransmissores e decoração | Continuam procedurais |
| Itens, armas e efeitos | Continuam procedurais |

A geração de imagens atingiu um limite temporário durante o trabalho. A folha de seis inimigos em `art-source/enemies-a-draft-not-integrated.png` foi preservada como rascunho. Ela contém um fundo quadriculado opaco e **não está integrada ao renderizador**. Não é uma folha transparente pronta para produção.

Esta atualização integra os agentes disponíveis. Ela não representa a conclusão de todos os sprites da primeira fase.

## Produção

Método: ferramenta integrada de geração de imagens, sem uso de API por chave própria. Os prompts estão em `art-source/PROMPTS.md`.

A integração foi validada com renderização Canvas e testes automatizados. A limitação anterior de validação em navegador real permanece descrita em `TESTES.md`.
