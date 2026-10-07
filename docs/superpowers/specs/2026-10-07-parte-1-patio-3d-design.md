# Parte 1: Pátio de Subestação 3D (Spec de Design)

- **Data:** 2026-10-07
- **Parte:** 1 (ver [roadmap](../../roadmap.md))
- **Status:** Revisões 1 e 2 (versão em R3F) e revisão 3 (cena principal em HTML único) implementadas, aguardando revisão.
- **Revisão 3:** o usuário pediu para usar o código HTML dele no 3D. Ele é a página principal (`index.html`), com a cidade, as torres e a usina ao lado da subestação.
- **Planos:** [revisão 1, implementada](../plans/2026-10-07-parte-1-patio-3d.md) e [revisão 2, referências visuais](../plans/2026-10-07-parte-1-revisao-visual.md)
- **Repositório:** `fluxograma3d`

> **Qual versão a spec descreve:** as seções 1 a 11 descrevem a versão em R3F (`r3f.html`, código em `src/`), que não é mais a página principal. A cena principal atual (`index.html`) é descrita na **seção 12**.

> Os itens marcados com **[PREMISSA]** ainda não foram confirmados. Confirme ou corrija cada um antes de seguir para o plano de implementação.

---

## 1. Objetivo

Construir uma cena 3D navegável no navegador com o pátio de uma subestação elétrica, centrada nos transformadores de potência, usando React Three Fiber.

O propósito é **visualização e apresentação** (portfólio, demo, apresentação a cliente). O visual é **estilizado, com aparência de jogo de celular**, visto **de cima**, em **isométrica**, como um diorama sobre fundo limpo.

### Referências visuais

Quatro ilustrações isométricas em `public/` guiam a forma e as cores dos equipamentos (arquivos `istockphoto-*-612x612.jpg`). Elas são só referência: não fazem parte do produto.

- **`istockphoto-1463961464`:** pátio completo em diorama, com cerca amarela, pórtico de treliça e transformadores de três buchas. Referência principal.
- **`istockphoto-1463801943`:** catálogo dos equipamentos isolados (transformador, TC, TP, seccionadora, armários, transformador em caixa).
- **`istockphoto-1463961466`:** corte de um pátio com muro de tijolos, que ajuda a ler a disposição dos equipamentos.
- **`istockphoto-537372312`:** usina, torres e casas. Pertence a uma parte futura (ver [roadmap](../../roadmap.md)), não à Parte 1.

### Critérios de sucesso

1. A subestação é reconhecível de relance: transformadores de potência, pórticos, barramentos e equipamentos de manobra com formas simplificadas, mas inconfundíveis.
2. A cena tem vida: pessoas se movem pelo pátio e trabalham, e a sala de monitoramento no prédio administrativo mostra operadores diante das telas.
3. O visual é coerente e agradável e se parece com as referências: equipamentos cinza-azulados com isoladores marrons, cerca amarela, formas simplificadas, sombras suaves, sem texturas fotográficas.
4. A câmera é isométrica, com inclinação fixa, e nunca desce ao nível do chão.
5. A navegação é fluida com mouse e com toque (arrastar, pinça para zoom, giro em volta).
6. Existe um modo de **tour de câmera** com pontos de vista pré-definidos (pátio, transformadores, sala de monitoramento), para conduzir uma apresentação.
7. Roda a 60 fps em um notebook comum e em celular intermediário, com as pessoas animadas.

---

## 2. Escopo

### Dentro do escopo (v1)

- Um pátio com **1 vão de entrada de linha**, **2 transformadores de potência** e **1 barramento** de saída, em arranjo de barra simples, classe 138/13,8 kV. **[PREMISSA]** Arranjo e classe só definem proporções e a ordem dos equipamentos no vão.
- Equipamentos procedurais estilizados (geometrias do three.js), com as formas das referências: transformador com três buchas de AT, equipamentos trifásicos em três colunas, pórtico de treliça com cadeias de isoladores e armários de comando.
- Layout do pátio definido em **dados** (arquivo TypeScript), não espalhado em JSX.
- Condutores curvos ligando os terminais dos equipamentos.
- **Prédio administrativo** ao lado do pátio, com a **sala de monitoramento** no interior (mesas, telas estáticas, painel mural, operadores sentados). O prédio aparece fechado, com telhado; o telhado fica transparente para revelar o interior (ver seção 4).
- **Pessoas trabalhando**: **[PREMISSA]** 6 a 8 personagens estilizados (capacete, colete), com animações em loop: caminhar por rotas pelo pátio, inspecionar um equipamento, agachar para uma manutenção, e operadores sentados na sala de monitoramento.
- Ambiente em **diorama**: uma placa retangular com espessura (camada de grama sobre solo) sobre fundo claro, piso de concreto na área do pátio, cerca amarela com painéis translúcidos, algumas árvores sobre a placa e iluminação diurna com sombras suaves.
- Câmera isométrica com rotação em volta, zoom e pan limitado, e tour de câmera por pontos de vista.

### Fora do escopo (v1)

- Realismo fotográfico (PBR detalhado, HDRI, pós-processamento pesado).
- Painel de informações ou seleção de equipamentos (o clique no prédio, para o telhado, é a única exceção).
- Animação de fluxo de energia.
- Dados em tempo real, integração com SCADA ou backend.
- Modelos `.glb` (podem substituir os procedurais depois, sem mudar a arquitetura).
- As demais partes da ideia (ver [roadmap](../../roadmap.md)). Esta spec cobre só a Parte 1.

---

## 3. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Build | Vite | Setup rápido, HMR, padrão do ecossistema R3F |
| Linguagem | TypeScript | Tipar o modelo de dados do pátio |
| UI | React 18+ | Requisito do R3F |
| 3D | `@react-three/fiber` + `three` (câmera ortográfica) | Requisito do projeto; a ortográfica dá a isométrica das referências |
| Helpers 3D | `@react-three/drei` | CameraControls, Instances, Outlines, ContactShadows |
| Testes | Vitest | Lógica de dados e geometria dos condutores |

Sem pós-processamento na v1 (mantém o desempenho em celular). Sem framework de UI: os controles do tour são poucos botões com CSS simples.

---

## 4. Equipamentos do pátio

Cada tipo de equipamento é um componente React isolado, com props de posição/rotação e um `id`. As formas são simplificadas e levemente exageradas para ler bem de cima e à distância.

| Componente | Representação estilizada |
|---|---|
| `PowerTransformer` | Tanque em caixa de cantos arredondados, **três buchas de AT** em fileira (altas) e **três de BT** (baixas), radiadores como **fileira de aletas** em cada lado, conservador no topo apoiado no tanque e caixa de comando na lateral |
| `CircuitBreaker` | **Trifásico**: base de aço e, para cada fase, duas colunas grossas com discos; caixa de comando ao lado |
| `Disconnector` (seccionadora) | **Trifásico**: para cada fase, duas colunas com lâmina horizontal, sobre um quadro de aço |
| `CurrentTransformer` (TC) | **Trifásico**: três colunas com cabeçote arredondado |
| `PotentialTransformer` (TP) | **Trifásico**: três colunas com base maior e tampa |
| `SurgeArrester` (para-raios) | **Trifásico**: três colunas finas com discos |
| `Gantry` (pórtico) | **Treliça** (duas colunas e uma viga de montantes, travessas e diagonais) com **cadeias de isoladores** penduradas na viga |
| `Busbar` (barramento) | Tubo grosso sobre isoladores de suporte |
| `ControlCabinet` (armário de comando) | Armário alto de cor clara sobre base, com porta e uma placa de aviso |
| `Conductor` | Curva suave entre dois terminais, tubo fino e escuro |

Componentes de ambiente: `Ground` (diorama: grama, solo e piso de concreto), `Fence` (cerca amarela com painéis), `Tree`, `Lighting`.

O componente `Insulator` (coluna com discos) é reutilizado por quase todos os equipamentos.

**Representação em linha única:** os condutores continuam sendo um por conexão, ligados ao terminal da fase central de cada equipamento. Os equipamentos trifásicos são só visuais; o modelo de dados não muda.

### Prédio administrativo e sala de monitoramento

| Componente | Representação estilizada |
|---|---|
| `AdminBuilding` | Volume retangular com paredes, piso interno, porta e janelas desenhadas nas paredes. Contém o `Roof` e a `MonitoringRoom` |
| `Roof` | Telhado estilizado (laje com beiral) que alterna entre fechado e aberto com um fade |
| `MonitoringRoom` | Ambiente dentro do prédio, com bancada em "U" ou linha de mesas, 4 a 6 monitores com tela emissiva de cor chapada (sem animação na v1), painel mural grande com unifilar estilizado, cadeiras e armários. Posiciona sozinha os `operators` da `Yard` nas mesas, em coordenadas locais do prédio |
| `Desk`, `Monitor`, `Chair` | Peças reutilizáveis da sala |

O prédio fica em posição fixa em `yard.ts`, junto à cerca e com a fachada voltada para o pátio.

#### Telhado que some

**[PREMISSA]** O estado `roofOpen` é um `boolean` guardado em `App` (`useState`) e passado para a cena.

- Clique ou toque no prédio alterna `roofOpen`. Esta é a única interação de clique da v1.
- Escolher o ponto de vista da sala de monitoramento no tour força `roofOpen = true`. Os demais pontos de vista não mudam o estado.
- O fade leva cerca de 0,4 s. Ao terminar com o telhado aberto, o `Roof` fica com `visible = false`, para não custar draw call nem sombra.
- Com o telhado aberto, as paredes ficam baixas ou parcialmente transparentes, para o interior continuar legível numa vista 3/4. Detalhe a validar no teste visual.
- Cursor `pointer` sobre o prédio no desktop.

### Pessoas

`Worker` é um personagem procedural, sem rig e sem modelo externo: corpo e cabeça como formas arredondadas, capacete e colete em cores vivas. As animações são feitas por código (oscilação de pernas e braços, inclinação do tronco, balanço sutil), em loop.

| Papel | Comportamento |
|---|---|
| Caminhante | Percorre uma rota (lista de pontos) pelo pátio, em loop, parando por 2 a 4 s em alguns pontos |
| Inspetor | Fica ao lado de um equipamento, olhando para ele e movendo um braço (lanterna ou prancheta) |
| Mantenedor | Agachado diante de um equipamento, com movimento repetitivo de braço |
| Operador | Sentado na sala de monitoramento, virado para os monitores, com leve movimento de cabeça e braço. É criado pela `MonitoringRoom`, não por `yard.workers` |

As rotas dos caminhantes são escritas à mão nos corredores livres do pátio. A v1 não tem desvio automático de obstáculos nem detecção de colisão.

### Materiais e paleta

Uma biblioteca central (`materials.ts`) com instâncias compartilhadas, todas em cor chapada, sem textura:

- `MeshStandardMaterial` com `flatShading` e rugosidade alta.
- Paleta das referências: cinza-azulado claro para transformadores, estruturas e armários, marrom-escuro para isoladores, amarelo para a cerca (painéis translúcidos em amarelo-alaranjado), cinza-escuro para os condutores, concreto claro no piso do pátio, verde na grama, tom terroso no solo da placa, laranja só para destaques pequenos.
- Fundo da cena em cor clara chapada (quase branca), sem horizonte.
- **[PREMISSA]** Contorno escuro fino nos equipamentos para reforçar o estilo de desenho animado.
  - O `Outlines` do drei duplica a geometria (casco invertido) e não combina com `<Instances>`. Por isso o contorno entra só em peças grandes e únicas (tanque do transformador e paredes do prédio), não em isoladores, treliças, cerca ou árvores.
  - É desligável por uma flag; se o celular não segurar 60 fps, sai da v1.

---

## 5. Arquitetura

```
src/
  main.tsx
  App.tsx                 # Canvas + controles do tour
  data/
    yard.ts               # layout do pátio: equipamentos + conexões
    terminals.ts          # terminais de cada tipo de equipamento (coordenadas locais)
    trees.ts              # posições das árvores sobre a placa
    cameraLimits.ts       # inclinação isométrica, limites de zoom e área de pan
    viewpoints.ts         # pontos de vista do tour
    types.ts              # tipos do modelo de dados
  scene/
    Scene.tsx             # monta a cena a partir de yard.ts
    materials.ts
    environment/          # Ground, Fence, Tree, Lighting
    equipment/            # um arquivo por equipamento + Insulator
    building/             # AdminBuilding, Roof, MonitoringRoom, Desk, Monitor, Chair
    people/
      Worker.tsx          # personagem + animação por papel
      routes.ts           # funções puras: rota + tempo → posição e direção
    conductors/
      Conductor.tsx
      curve.ts            # funções puras: terminais → curva
    camera/
      CameraRig.tsx       # navegação aérea + transição entre viewpoints
  ui/
    TourControls.tsx
```

### Modelo de dados

```ts
type EquipmentType =
  | 'transformer' | 'breaker' | 'disconnector'
  | 'ct' | 'pt' | 'arrester' | 'gantry' | 'busbar' | 'cabinet';

interface Equipment {
  id: string;
  type: EquipmentType;
  position: [number, number, number];
  rotationY?: number;
}

interface Connection {
  from: { equipmentId: string; terminal: string };
  to:   { equipmentId: string; terminal: string };
  sag?: number;   // flecha da curva, em unidades da cena
}

type WorkerRole = 'walker' | 'inspector' | 'maintainer';

interface WorkerSpec {
  id: string;
  role: WorkerRole;
  position: [number, number, number];       // ponto inicial ou posição fixa
  route?: [number, number, number][];       // só para 'walker'
  facing?: [number, number, number];        // ponto para onde olha (inspector, maintainer)
  vestColor?: string;
}

interface Yard {
  equipment: Equipment[];
  connections: Connection[];
  workers: WorkerSpec[];                    // só as pessoas do pátio
  building: {
    position: [number, number, number];
    rotationY?: number;
    operators: number;                      // a MonitoringRoom senta cada um na sua mesa
  };
}

interface Viewpoint {
  id: string;
  label: string;                            // texto em pt-BR
  position: [number, number, number];
  target: [number, number, number];
  span: number;                             // largura da cena visível, em unidades (define o zoom)
  openRoof?: boolean;                       // true força o telhado aberto ao chegar
}
```

Os **terminais** de cada tipo (ex.: `hv1`, `lv1`) ficam em `terminals.ts`, como coordenadas locais ao equipamento. Os componentes usam esse mesmo arquivo para posicionar buchas e isoladores, então condutor e equipamento nunca divergem.

`curve.ts` converte terminal local em coordenada de mundo (aplicando posição e `rotationY`) e gera a curva. A validação do `yard.ts` e os testes usam só `terminals.ts`, sem renderizar nada.

### Convenções

- **Unidade:** 1 unidade = 1 m nominal. As proporções são exageradas pelo estilo, mas as dimensões partem de equipamentos reais.
- **Eixos:** Y para cima, chão em `y = 0`, pátio centrado na origem.
- **Tamanho do pátio:** **[PREMISSA]** cerca de 60 m × 40 m, com o prédio fora ou na borda da área de brita.
- **Idioma:** identificadores e comentários de código em inglês, textos da interface (rótulos dos pontos de vista, botões) em português do Brasil. **[PREMISSA]**
- **Navegador:** WebGL2 (Chrome, Edge, Firefox e Safari atuais; Safari iOS 15+).

### Fluxo de dados

1. `Scene` lê `yard.ts` e renderiza um componente por equipamento via mapa `type → componente`.
2. `Scene` renderiza um `Conductor` por conexão, o `AdminBuilding` com a `MonitoringRoom` e um `Worker` por entrada de `workers`.
3. Cada `Worker` atualiza posição e pose em `useFrame`, usando as funções puras de `routes.ts`.
4. `TourControls` lista os `viewpoints`; ao escolher um, `CameraRig` faz a transição suave da câmera e, se o ponto tem `openRoof`, `App` define `roofOpen = true`.
5. O clique no `AdminBuilding` alterna `roofOpen`; o `Roof` anima o fade a partir desse valor.

---

## 6. Câmera (isométrica)

Câmera **ortográfica** no ângulo isométrico das referências:

- Inclinação **fixa** de cerca de 54,7° a partir da vertical (35,3° de elevação), travada nos controles. A câmera nunca desce ao nível do chão.
- Rotação horizontal livre em volta do pátio.
- Zoom limitado por uma largura visível mínima e máxima (`span`, em unidades da cena), convertida em zoom pela largura da tela. Isso mantém o enquadramento em telas estreitas.
- Pan limitado à área da placa, para o usuário não "se perder" no vazio.
- Vista inicial: o diorama inteiro, com margem, vindo do canto sudoeste.
- Todos os pontos de vista do tour usam a mesma inclinação e o mesmo canto; mudam o alvo e o `span`.
- Toque: um dedo arrasta (pan), dois dedos fazem pinça (zoom) e giro.

---

## 7. Iluminação e estilo

- Uma luz direcional (sol) com sombras suaves, mais uma `hemisphereLight` para encher as sombras com cor.
- Shadow map de tamanho moderado, ajustado ao tamanho do pátio.
- Fundo de cor clara chapada, em vez de HDRI.
- Sem névoa: o diorama tem borda definida e fundo limpo.

---

## 8. Desempenho

- Geometrias e materiais compartilhados entre instâncias do mesmo equipamento.
- `<Instances>` do drei para itens muito repetidos (discos de isoladores, placas de radiador, mourões da cerca, árvores).
- Pessoas com geometria e material compartilhados; só a cor do colete varia. Poucos polígonos por personagem.
- O material do `Roof` só é transparente durante o fade; fechado, volta a ser opaco para evitar problemas de ordenação.
- Sombras apenas da luz principal. Os painéis translúcidos da cerca não projetam sombra.
- Os equipamentos trifásicos e as treliças aumentam o número de malhas. Se o fps cair, o passo seguinte é trocar as colunas e as barras das treliças por `<Instances>`.
- `dpr` limitado (por exemplo, máximo 2) para economizar GPU em telas de alta densidade.
- `frameloop="always"`, porque as pessoas estão sempre em movimento.
- Animação baseada em tempo (`delta`), nunca em número de frames.

---

## 9. Tratamento de erros

- Validação do `yard.ts` na inicialização: conexão referenciando `equipmentId` ou `terminal` inexistente gera erro claro no console e o condutor não é renderizado, sem derrubar a cena.
- Tipo de equipamento sem componente mapeado: renderiza uma caixa placeholder e registra um aviso.
- `ErrorBoundary` em volta do `Canvas` com mensagem caso o WebGL não esteja disponível.

---

## 10. Testes

- **Vitest (unitário):** validação do modelo de dados (usando `terminals.ts`), conversão terminal → coordenada de mundo, geração das curvas dos condutores e `routes.ts` (posição e direção ao longo da rota, pausas e retorno ao início).
- **Visual (manual):** checklist de revisão (equipamentos reconhecíveis, condutores conectados nos terminais, telhado abre e fecha por clique e pelo tour, interior da sala de monitoramento legível de cima com o telhado aberto, pessoas sem atravessar equipamentos, paleta coerente, limites de câmera funcionando, tour funcionando, fps aceitável no desktop e no celular).
- Componentes 3D puramente visuais não terão teste automatizado na v1.

---

## 11. Decisões

### Confirmadas

- Propósito: visualização e apresentação.
- Estilo estilizado, com aparência de jogo de celular, visto de cima.
- Pátio pequeno: 1 entrada de linha, 2 transformadores, 1 barramento de saída.
- Tour de câmera na v1.
- Telas da sala de monitoramento estáticas.
- Telhado do prédio que some, em vez de corte permanente.
- Câmera isométrica fixa (ortográfica), no lugar da perspectiva 3/4.
- Base em diorama (placa com espessura sobre fundo limpo), no lugar do terreno aberto.
- Paleta cinza-azulada com cerca amarela, como nas referências.
- Equipamentos com as formas das referências (três buchas, trifásicos, treliça, armários).

### Ainda como premissa (corrija se discordar)

- O pátio cabe numa placa de cerca de 96 m × 60 m, com o prédio sobre ela.
- Barra simples e classe 138/13,8 kV.
- Quatro papéis de pessoas, 6 a 8 no total.
- Contorno nos equipamentos grandes, sujeito ao teste de desempenho no celular.
- Pátio de cerca de 60 m × 40 m.

---

## 12. Revisão 3: cena principal em HTML único (`index.html`)

Esta seção descreve a cena que abre na página principal. Ela parte do código HTML fornecido pelo usuário (a subestação) e recebeu acréscimos pedidos depois. A versão em R3F das seções 1 a 11 continua em `r3f.html` e não é mantida junto com esta.

### 12.1 Stack e execução

- Página única, sem build próprio para a cena: React 18 (UMD), Babel standalone, Tailwind CDN, Three.js r128 e `OrbitControls`, todos carregados por CDN. **A página precisa de internet para abrir.**
- O código da cena é vanilla Three.js dentro de um `useEffect` de um componente React. A interface (cabeçalho, presets de câmera, modos de render, carga do transformador, alarmes) é a do código do usuário.
- O Vite serve `index.html` e `r3f.html`; o build compila as duas páginas.
- Não há testes automatizados para esta cena. A verificação é visual, com capturas do Chrome headless e leitura do console.

### 12.2 O que veio do usuário e o que foi acrescentado

| Elemento | Origem |
|---|---|
| Subestação (transformador de 3 buchas, pórtico de treliça, 2 disjuntores, armários, para-raios, cabos, cerca amarela, placa de concreto, grama) | Código do usuário. As cores não mudam |
| Interface e modos de render (só padrão e Fim de Tarde; raio-X, termografia e noturno saíram a pedido). Por pedido, saíram o título, o rodapé de métricas, o áudio de 60 Hz e o controle de carga; a carga ficou fixa em 78% e só o botão do disjuntor continua | Código do usuário, com cortes |
| Cidade, torres de transmissão e cabos, em torno de postes e casas | Código do usuário, enviado depois (somente a parte 3D; a subestação em caixa dele não foi usada) |
| Usina elétrica (prédios, chaminés, ventoinhas, tambores, fumaça) | Código do usuário, enviado depois (somente a parte 3D; o pequeno pátio de transformadores dela foi removido a pedido) |
| 2 pessoas andando entre a subestação e a usina | Acréscimo |
| Interior do escritório da usina (3 mesas com PC, 3 pessoas sentadas, 1 andando) | Acréscimo |
| Treetech: segunda empresa, com o servidor (RabbitMQ, Sigma e banco) | Acréscimo |
| Módulos TM, BM, GMP e DM nos equipamentos, fábrica de módulos, estrada com vans | Acréscimo (ver 12.6.5 a 12.6.7) |
| Comunicação E3 e Sync, filas, bancos e painel do Sigma ECM | Acréscimo, conforme [dominio-treetech.md](../../dominio-treetech.md) |
| Tour guiado de oito passos | Acréscimo (ver 12.6.8) |
| Postes de luz na cidade e na estrada | Pedido do usuário |
| Salas de desenvolvimento de protótipos na fábrica, cidade com carros e moradores, modo Fim de Tarde | Pedido do usuário (ver 12.6.5, 12.6.9 e 12.7) |
| Portões nas cercas leste e sul | Acréscimo |
| Cores mais apagadas na cidade e na usina | Ajuste pedido |

### 12.3 Disposição na cena

Unidade em metros nominais; Y para cima; a subestação fica na origem.

| Elemento | Posição e tamanho (mundo) |
|---|---|
| Subestação | Origem. Placa de grama 26 × 26, placa de concreto 16 × 16 (topo em y = 0,3), cerca em ±7,3 |
| Usina | Centro em (16,4; 0,3; 0), girada meia volta. Base de 16 × 16 com borda de 16,8, **encostada** na placa de concreto da subestação e na mesma altura. Grama própria de 26 × 26 sob ela |
| Torres de transmissão | Em (34; −4,5) e (44; −4,5), alinhadas com o pórtico da subestação |
| Cidade | Chão de 34 × 34 com centro em (54; −18,5), duas ruas em cruz, 8 casas, 8 postes, árvores |
| Faixa de grama de ligação | De x = 12,5 a x = 72 e de z = −37 a z = 13, abaixo da cidade e das torres |
| Treetech | Centro em (54; 0,3; 9,5), ao sul da cidade. Base de 16 × 16 e grama de 26 × 26 (ver 12.6.2) |
| Fábrica de módulos | Centro em (54; 0,3; 33), ao sul da estrada (ver 12.6.5) |
| Estrada | Em z = 19,5, de x = −5 a x = 65, com ramal em x = −4 até o portão sul (ver 12.6.6) |
| Antenas | Uma na subestação, em (2,8; 0,345; 5,3), e outra na Treetech, em (60,8; 0,3; 7,5) |
| Bancos de dados e fila | Cilindros em x = 60,9 (z = 2,6 e 4,5); fila em (58; 0,3; 3,4) (ver 12.6.3) |

A usina está girada para as chaminés e os prédios altos ficarem do lado sul, longe dos cabos que saem do pórtico.

### 12.4 Cabos e energia

- Três cabos saem dos isoladores do pórtico da subestação, passam pelas duas torres e chegam ao primeiro poste da cidade. Dali, cada poste liga um cabo à sua casa.
- Pulsos amarelos correm pelos cabos principais.
- O estado do disjuntor controla a cidade: com o disjuntor aberto, os pulsos somem, os cabos ficam cinza e as janelas das casas apagam. O estado é lido por uma referência (`breakerClosedRef`), porque o `useEffect` da cena roda uma só vez.

### 12.5 Usina

- Prédio principal alto com duas chaminés, prédio intermediário com 4 ventoinhas, prédio laranja baixo com 2 chaminés listradas, 3 ventoinhas e um duto, e 4 tambores de óleo.
- Animação: ventoinhas giram (0,25 rad por quadro) e há fumaça subindo das 4 chaminés (6 partículas por chaminé).
- As ventoinhas ficam na altura do teto de cada prédio (o código original usava sempre a altura do prédio intermediário, o que deixava as do prédio laranja flutuando).
- Não há pátio de transformadores nem luz de faísca dentro da usina.

### 12.6 Pessoas

Duas pessoas, com capacete e colete (laranja e amarelo), andando continuamente a 1,3 e 1,1 unidade por segundo. Cada uma percorre um circuito fechado, em sentidos opostos, que passa pelo portão:

1. Dá a volta pelo pátio da subestação, por dentro da cerca.
2. Sai pelo **portão da cerca leste** (vão de 2,8 unidades, centrado em z = 0,35, no corredor entre o arrestador e o disjuntor).
3. Contorna os prédios da usina por corredores livres (pontos do circuito: (14,2; 0,35), (14,2; −6,5), (23,2; −6,5), (23,2; 6,8), (11; 6,8), (11; 0,35)).
4. Volta pelo mesmo portão.

As rotas são escritas à mão. Não há desvio de obstáculos nem detecção de colisão, e as duas pessoas dividem o corredor do portão e se atravessam ali. A passada é sincronizada com a distância percorrida.

### 12.6.1 Interior do escritório (prédio laranja da usina)

O prédio laranja deixou de ser uma caixa maciça: tem piso, quatro paredes e um telhado separado (com as 2 chaminés e as 3 ventoinhas). Os demais prédios da usina continuam maciços.

- **Abrir e fechar:** clicar no prédio alterna o telhado (o clique é ignorado se o mouse foi arrastado mais de 5 px, e só vale sobre a cena, não sobre os painéis). O botão **Interior** abre o telhado e leva a câmera para dentro. Com o telhado aberto, as paredes baixam a 30% da altura, com animação suave; o telhado some junto com as chaminés e as ventoinhas.
- **Mobília:** 3 mesas em fileira, cada uma com um **PC** (monitor com tela emissiva voltada para a cadeira, teclado e torre sob a mesa) e uma cadeira.
- **Pessoas:** **3 sentadas**, uma em cada mesa, virando para o monitor, com as pernas à frente e os braços no teclado (movimento leve de digitação e de cabeça), e **1 pessoa andando** de um lado a outro do corredor atrás das cadeiras (0,8 unidade por segundo).
- **Cores:** mobília e roupas em tons apagados, como o resto da usina.
- O interior vem fechado por padrão, para não mudar a vista geral.

### 12.6.2 Treetech (segunda empresa, com o servidor do RabbitMQ, do Sigma e do banco)

Uma segunda empresa, **perto da cidade**, logo ao sul dela: centro em (54; 0,3; 9,5), com grama própria de 26 × 26 e base de concreto de 16 × 16 na mesma altura da usina, e um meio-fio verde-claro. A base fica a cerca de 2,6 unidades do chão da cidade, ao lado das torres de transmissão.

- **Nome:** uma placa em pórtico na entrada, com o nome **Treetech em verde** e uma pequena árvore, legível dos dois lados. O verde é o único tom forte da empresa; o prédio é claro e neutro.
- **Prédio:** 10 × 6 e 4 unidades de altura, com piso, paredes, janelas, porta e telhado com um aparelho de ar-condicionado. Abre e fecha como o escritório da usina: o clique no prédio alterna o telhado, e as paredes baixam a 30% da altura quando ele abre.
- **Interior:** o escritório principal tem **5 mesas com PC** em duas fileiras (3 junto à parede norte e 2 no meio), **5 funcionários sentados** (um em cada mesa, em tons de verde) e **1 funcionário andando** pelo corredor entre as fileiras. A mesa central da fileira norte é a do servidor: ao lado dela fica a **torre do servidor RabbitMQ**, com uma etiqueta "RabbitMQ" e um LED verde, e o monitor dela mostra "Management", "RabbitMQ", "broker porta 5672" e "online". Os funcionários sentados movem os braços e a cabeça como quem digita, como no escritório da usina.
- **Câmera:** o preset **Treetech** abre o telhado e mostra o interior. A Visão Geral foi afastada para enquadrar a nova empresa.
- **Papel na cena:** a torre do servidor representa o servidor da Treetech, que roda o RabbitMQ, o Sigma ECM e o banco de dados (decisão do usuário). A fila e os bancos ficam do lado de fora, para aparecerem no tour.
- **Ligação com o escritório da usina:** ver a seção 12.6.3.

### 12.6.3 Comunicação simulada: módulos, E3, Sync, banco e Sigma ECM

Esta é a parte que explica o domínio descrito em [dominio-treetech.md](../../dominio-treetech.md). Os dados são **simulados no navegador**; nada fala com um RabbitMQ real.

| Conceito | No 3D |
|---|---|
| Módulo da Treetech (TM, BM, GMP, DM 1, DM 2) | Caixa branca com faixa verde e LED, presa a um equipamento da subestação (ver 12.6.7) |
| Rede TCP/IP | Uma antena na subestação e outra no pátio da Treetech; arcos de luz ligam cada módulo à antena da subestação e as antenas entre si |
| E3 | Pacote azul (pergunta) do servidor até o módulo; pacote verde (resposta) de volta |
| Sync | Pacote laranja do módulo até a fila do RabbitMQ (tubo de vidro); o Sigma retira da fila |
| Fila do RabbitMQ | Tubo de vidro ao lado da Treetech, em (58; 0,3; 3,4); a pilha de caixas laranja é a profundidade (até 7 visíveis) |
| Banco de dados | Dois cilindros (PostgreSQL e SQL Server) ao lado da fila; um fica destacado em verde e a escolha alterna a cada 14 s |
| Servidor da Treetech | A torre dentro do escritório da Treetech; o LED pisca em branco a cada pacote que chega |
| Sigma ECM | O painel de telas da sala anexa (ver 12.6.4) |
| Usuários do Sigma | Os PCs do escritório da usina, ligados ao servidor por cabos no chão: um pacote azul (pedido) vai e um verde (resposta) volta |

- **Sync (modo padrão):** cada módulo envia uma atualização a cada 3 a 7 s. Ela segue o arco do módulo à antena da subestação, o arco entre as antenas e o arco da antena da Treetech à fila. O Sigma retira uma mensagem da fila a cada 0,9 s (ou espera 0,4 s se a fila está vazia) e a manda ao banco em uso; depois a informação segue até o painel.
- **E3:** a cada 1,4 s o Sigma consulta um módulo, em rodízio. A pergunta faz o caminho inverso do Sync, até o módulo, que acende o LED; a resposta volta, é gravada no banco e aparece no painel. A fila não é usada.
- **Troca de modo:** ao trocar entre E3 e Sync, os pacotes em trânsito são descartados e a fila é zerada, para o novo modo aparecer limpo.
- **Velocidade:** os pacotes andam a 14 unidades por segundo nos arcos e a 6 nos cabos. Cada passo da simulação é limitado a 0,1 s, então em quadros lentos ela anda mais devagar que o relógio.
- Os arcos de luz são um desenho esquemático da rede, não o meio físico real.

### 12.6.4 Sala do painel de telas (anexo da Treetech)

Um anexo de 6 × 6 no lado oeste do escritório da Treetech, com base de concreto ampliada e uma parede divisória compartilhada com o escritório principal. Ele abre e fecha junto com o escritório (o mesmo telhado e as mesmas paredes baixas).

- **Painel:** uma parede de **4 × 2 telas** (4,8 × 1,5 unidades) sobre duas colunas, voltada para o sul. Uma imagem única de 1920 × 600 é desenhada em um canvas e dividida em 8 telas por molduras escuras.
- **Operadores:** 2 mesas com PC e 2 funcionários sentados, virados para o painel.
- **Dashboard (Sigma ECM)**, redesenhado a cada 0,5 s com os dados da simulação:
  - *Comunicação*: o modo atual (Sync em laranja ou E3 em azul), a descrição e as leituras por segundo.
  - *Fila RabbitMQ*: profundidade atual, com uma barra.
  - *Módulos*: TM (temperatura do óleo, ligada à carga), BM, GMP (umidade) e DM (contatos fechados ou abertos conforme o disjuntor).
  - *Subestação*: estado do disjuntor, potência e carga, lidos da interface da subestação.
  - *Leituras por segundo (60 s)*: gráfico das leituras recebidas e das gravadas, em duas telas de largura.
  - *Banco de dados*: o banco em uso e os totais de leituras recebidas, gravadas e exibidas.
  - *Eventos*: as 6 últimas ações, com a hora (por exemplo, "TM enviou (Sync)", "Sigma consultou BM (E3)", "gravado: PostgreSQL").
- **Câmera:** o preset **Painel** abre o telhado e mostra o painel de frente.

### 12.6.5 Fábrica de módulos

Um galpão da Treetech ao sul da estrada, em frente à Treetech: centro em (54; 0,3; 33), com grama e base de concreto de 16 × 16 e um pátio na entrada.

- **Prédio:** 14 × 8, com paredes claras e faixa verde na base, telhado de duas águas, portão de enrolar na frente (voltada para a estrada), janelas e uma placa "Treetech, Fábrica de módulos".
- **Interior:** uma esteira de 9,4 com 7 módulos passando em ciclo, 3 funcionários na montagem (movendo os braços) e 1 supervisor andando pelo corredor da frente. Há caixas de módulos empilhadas dentro e na entrada.
- **Ala de protótipos:** uma ala de 14 × 5,5 atrás da linha de produção, com três salas (plaquetas na fachada sul): **Eletrônica** (bancada com 3 protótipos de módulos, placa, estante com caixas e 1 engenheiro), **Testes e ensaios** (câmara de ensaio térmico com um módulo em cima, bancada com osciloscópio e 1 engenheiro) e **Projeto e P&D** (2 mesas com PC, 2 engenheiros sentados e um quadro branco com o esboço de um novo módulo). A base de concreto foi ampliada para a ala.
- **Abrir e fechar:** o clique no prédio alterna o telhado, como nos outros prédios; o preset **Fábrica** abre o telhado e mostra o interior.

### 12.6.6 Estrada e vans

- **Estrada principal:** de x = −5 a x = 65 em z = 19,5, com largura de 3,2 e faixa central tracejada, entre a Treetech (ao norte) e a fábrica (ao sul). Um **ramal** sobe pelo x = −4 até o **portão sul** da cerca da subestação, aberto na cerca (vão de 2,8). Postes de luz ficam ao longo da estrada, no lado sul.
- **Chão de ligação:** uma faixa de grama de 80 × 11 liga a placa da subestação à Treetech e à fábrica.
- **Vans:** duas vans brancas com faixa verde percorrem um circuito de ida e volta, em faixas separadas, a 4,5 unidades por segundo. Saem do pátio da fábrica com uma caixa de módulos no teto, vão pela faixa norte até o portão sul da subestação, dão a volta e voltam pela faixa sul, sem a caixa. As duas andam defasadas em meio circuito.

### 12.6.7 Módulos instalados na subestação

Caixas brancas com faixa verde e LED, com rótulos sempre visíveis:

| Módulo | Onde fica |
|---|---|
| TM | No lado leste do tanque do transformador |
| BM | No topo do transformador, perto das buchas |
| GMP | No chão, a leste do transformador, ligado ao tanque por um tubo |
| DM 1 | No lado leste do disjuntor da esquerda |
| DM 2 | No lado leste do disjuntor da direita |

### 12.6.8 Tour guiado

O botão **Tour: como funciona** leva a câmera por oito passos, com um painel de texto (título e explicação, "Anterior" e "Próximo"). Cada passo posiciona a câmera, escolhe o modo de comunicação (E3 ou Sync), abre ou fecha os telhados e mostra os rótulos do passo.

1. **A Treetech**: fabrica módulos e também criou o software que os monitora.
2. **A fábrica de módulos**: o galpão com a esteira (telhado aberto).
3. **A Treetech entrega e instala**: a Treetech disponibiliza os módulos, instala nos equipamentos e acompanha a operação (sem explicar o transporte).
4. **Os módulos instalados**: TM, BM, GMP e DM nos equipamentos.
5. **Forma 1: E3 (TCP/IP)**: modo E3, vista ampla da rede.
6. **Forma 2: Sync (RabbitMQ)**: modo Sync, vista da fila.
7. **O banco de dados**: os dois cilindros.
8. **Sigma ECM**: o painel de telas (telhado do escritório aberto).

Ao concluir ou fechar o tour, a cena volta ao modo Sync e aos rótulos padrão (só os dos módulos).

### 12.6.9 Cidade viva

- **Carros:** 3 carros de cores apagadas percorrem a avenida da cidade em um circuito de duas faixas (3,2, 2,6 e 3,6 unidades por segundo), com faróis e lanternas.
- **Moradores:** 4 pessoas sem capacete andam nas calçadas, em escala 0,7, indo e voltando nos dois sentidos.
- Os carros fazem a curva nas pontas da avenida sem suavização, e não há desvio entre eles.

### 12.7 Câmera, luz e sombras

- Câmera em perspectiva (FOV 40) com `OrbitControls`, distância entre 5 e 220 e sem passar do chão.
- Presets: **Visão Geral** (inicial), **Cidade**, **Usina**, **Interior** (abre o telhado do escritório), **Treetech** (abre o telhado da segunda empresa), **Rede** (cabos e fila do RabbitMQ), **Painel** (parede de telas do dashboard), **Isométrica** (a vista de 22, 18, 22 sobre a subestação), **Planta Baixa**, **Trafo 01** e **Pórtico AT**.
- **Modos de render:** Standard 3D e **Fim de Tarde**. O Fim de Tarde faz uma transição de cerca de 0,6 s: sol baixo e alaranjado (vindo do sudoeste, com sombras longas), luz ambiente arroxeada, céu em degradê, janelas dos prédios da Treetech acesas, faróis e lanternas dos veículos acesos, e todos os postes de luz com halo e poça de luz no chão. Há 9 luzes de ponto reais, nos postes alternados, e as 4 luzes de segurança da subestação. As luzes da cidade seguem o disjuntor: com ele aberto, os postes da cidade apagam.
- Sol com sombras em um quadro de ±80 e mapa de 4096, para a cena inteira ter sombra. Isso deixa a sombra da subestação menos nítida que no código original.

### 12.8 Paleta

- **Subestação:** inalterada.
- **Cidade e torres:** tons acinzentados. Telhados em tijolo, azul-aço, areia, verde-sálvia, lilás, rosa antigo e ardósia; terrenos e árvores em verde-sálvia; isoladores marrons; cabos verdes e azuis acinzentados; pulsos e janelas em amarelo-creme.
- **Usina:** terracota apagado no prédio laranja, vinho acinzentado nas chaminés e no telhado, areia nos anéis, nas ventoinhas e nos tambores. A faixa de perigo da base usa os mesmos tons.

### 12.9 Limitações conhecidas (herdadas do código do usuário)

- O `useEffect` da cena tem lista de dependências vazia, então os botões de disjuntor e de carga não atualizam o LED dos disjuntores nem as partículas de cabo da subestação. Só a cidade reage ao disjuntor (pelo acréscimo da seção 12.4).
- O clique para inspecionar componentes só alcança o grupo da subestação. Cidade, torres e usina não são clicáveis.
- Os dados da comunicação são simulados no navegador, e os fatos sobre E3, Sync/RabbitMQ e PostgreSQL/SQL Server vêm só da explicação do usuário (ver [dominio-treetech.md](../../dominio-treetech.md)).
- As luzes de ponto do Fim de Tarde aumentam o custo de render em celulares fracos; o desempenho não foi medido.
- A cena precisa de internet, porque React, Three e Tailwind vêm de CDN.
- O desempenho (fps) não foi medido em GPU real nem em celular.

### 12.10 Pontos em aberto

- As quatro imagens de referência do iStock continuam em `public/` e seriam publicadas junto com o site. Elas deveriam ir para `docs/referencias/`.
- A versão em R3F (`r3f.html`, `src/`) continua no repositório, mas não é mantida. Duas correções que o revisor apontou nela ficaram pendentes: o gesto de pinça no celular e os condutores do para-raios que atravessam a bucha vizinha.
- O portão da cerca leste existe, mas o resto da cerca separa a subestação da usina. Se as duas devem ser um pátio só, o trecho leste da cerca pode ser removido.
