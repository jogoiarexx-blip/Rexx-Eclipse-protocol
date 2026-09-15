# REXX — Inimigos por fase

Seis PNGs com transparência real: cinco folhas de inimigos e uma de chefes. Há 260 quadros no total, organizados em sequências de quatro quadros de movimento. Inimigos compartilhados entre mapas têm variantes visuais regionais; os 60 grupos das cinco fases não representam 60 espécies únicas.

Abra **preview.html** para selecionar uma fase e visualizar as sequências animadas. Funciona sem servidor. As imagens originais permanecem intactas, com seus metadados.

| Folha | Conteúdo |
|---|---|
| 01-Zona-Zero | 12 tipos da população do mapa; 48 quadros |
| 02-Deserto-de-Vidro | 11 tipos + Devorador Angular elite; 48 quadros |
| 03-Complexo-Omega | 11 tipos + Executor Ômega elite; 48 quadros |
| 04-Floresta-Corrompida | 11 tipos + Raiz Faminta elite; 48 quadros |
| 05-Abismo | 11 tipos + Arauto de Fenda elite; 48 quadros |
| 06-Chefes | Os cinco chefes regionais; 20 quadros |

Nas folhas de inimigos, cada linha tem dois grupos: os quatro desenhos à esquerda formam uma sequência e os quatro à direita formam outra. Nos chefes, cada linha contém um chefe em quatro quadros.

**Use as coordenadas de atlas.json**, não uma divisão fixa de 256 pixels. As imagens geradas têm 1254×1254 pixels (inimigos) e 1122×1402 pixels (chefes), e seus espaçamentos variam. O atlas identifica cada recorte e o relaciona ao ID usado no código do jogo. `atlas-data.js` contém os mesmos dados para abrir a prévia diretamente pelo disco, sem fetch.

Os quadros foram criados por geração de imagens integrada, com revisão de transparência e conteúdo dos recortes. Os prompts completos estão em cada pasta. As sequências representam movimento frontal/sul; não são conjuntos completos de oito direções, ataques e mortes. Pequenas variações de contorno entre quadros são próprias das folhas geradas e podem receber polimento posterior.

Os IDs `e0` a `e21` correspondem ao catálogo de inimigos do jogo. O sufixo `_elite` indica a variante elite específica. `b0` a `b4` são os chefes. Não há redefinição de atributos ou colisões nos arquivos de arte.
