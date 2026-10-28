# Cena principal (`index.html`)

O `index.html` é só a casca (CDNs, estilo e o `<script type="text/babel">`). O código vive nesta pasta e o Vite o junta ao servir ou construir a página.

## Como funciona a montagem

Uma linha `/* @include app/caminho/arquivo.js */` é trocada pelo texto do arquivo (de forma recursiva) pelo plugin `htmlInclude` de [vite.config.mjs](../vite.config.mjs). O resultado é o mesmo script de antes, na mesma ordem, então variáveis declaradas num arquivo valem nos arquivos seguintes do mesmo bloco.

- Editar qualquer arquivo de `app/` recarrega a página no `npm run dev`.
- Cada arquivo é um trecho de código completo (instruções inteiras), nunca um pedaço de expressão.
- Para criar um arquivo novo, escreva-o aqui e coloque a linha `@include` no lugar certo do arquivo pai.

## Mapa

| Caminho | O que tem |
|---|---|
| `main.jsx` | Ícones, dados do tour, o componente `App` e a renderização |
| `App.jsx` | Estados do React, o efeito da cena 3D e o JSX da interface |
| `data/` | Passos do tour (`tour-steps.js`) e etapas do pacote E3 e Sync (`flow-stages.js`) |
| `ui/` | Presets de câmera, controles do tour, disjuntor e os painéis (`ui/panels/*.jsx`) |
| `scene/scene-effect.js` | O `useEffect` da cena; lista, na ordem, todos os arquivos de `scene/` |
| `scene/setup.js` | Renderer, câmera, luzes e materiais |
| `scene/substation/` | Chão único, cerca e equipamentos da subestação |
| `scene/people/` | Pessoas andando na subestação |
| `scene/office/` | Equipe de software da Treetech: kit de pessoas e telas (`life-kit/`), mesas, café e montagem (`office-life/`) |
| `scene/city/` | Cidade, torres, vida nas casas (`home-life/`) e trânsito |
| `scene/plant/` | Usina elétrica |
| `scene/treetech/` | Prédio da Treetech (3 andares, reunião com o cliente), módulos, estrada e instalador |
| `scene/factory/` | Fábrica de módulos (`factory/`) e vans |
| `scene/network/` | Antenas, bancos, fila do RabbitMQ, pacotes E3 e Sync, câmera que segue o pacote e dashboard |
| `scene/dusk.js` | Modo Fim de Tarde |
| `scene/scene-api.js` | Ponte entre o React e a cena (tour, telhados, rótulos) |
| `scene/interaction.js` | Cliques e redimensionamento |
| `scene/failure/` | Cenário de falha: fumaça, fogo, explosão, ruínas e apagão |
| `scene/loop.js`, `scene/cleanup.js` | Laço de animação e limpeza |

## Limites desta divisão

Os arquivos de `scene/` compartilham as variáveis do mesmo `useEffect` (por exemplo `scene`, `net`, `follow`). Por isso a ordem das linhas `@include` em `scene-effect.js` importa: um arquivo só pode usar o que os anteriores já declararam.
