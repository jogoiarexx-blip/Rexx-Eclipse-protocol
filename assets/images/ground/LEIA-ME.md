# Pisos regionais — REXX v1.0.3

| Região | Arquivo | Material |
|---|---|---|
| Zona Zero | zero.png | Asfalto e concreto rachados |
| Deserto de Vidro | glass.png | Areia vitrificada âmbar |
| Complexo Ômega | omega.png | Placas metálicas industriais |
| Floresta Corrompida | forest.png | Solo, folhas e raízes |
| Abismo | abyss.png | Basalto dimensional violeta |

Cinco imagens opacas originais de 1254 × 1254 pixels, preservadas sem edição. Método: ferramenta integrada de geração de imagens; prompts completos em PROMPTS.json. Não são folhas de animação: o chão é estático.

O renderizador reduz cada imagem para 512 unidades em um Canvas em memória, espelha suas cópias num padrão de 1024 × 1024 e aplica tonalização uniforme de 26%. Assim as bordas do padrão coincidem, sem depender de correspondência perfeita nas imagens geradas. A simetria do espelhamento pode ser percebida; não são terrenos infinitamente únicos. Os PNGs originais não foram alterados.

Padrões ficam em cache e seguem as coordenadas do mundo. O chão não cria obstáculos nem muda colisões ou perigos. Decoração adicional e efeitos seguem procedurais. Abra preview.html para ver o resultado usado no jogo; abra os PNGs para ver as fontes sem tonalização.
