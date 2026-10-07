# Parte 1: Pátio de Subestação 3D (Spec de Design)

- **Data:** 2026-10-07
- **Parte:** 1 (ver [roadmap](../../roadmap.md))
- **Status:** Revisões 1 e 2 (referências visuais) implementadas, aguardando revisão.
- **Revisão 3:** o usuário pediu para usar exatamente o código HTML dele no 3D. Ele é a página principal (`index.html`) e não segue esta spec: usa Three.js r128 e React 18 por CDN, câmera em perspectiva e painéis de telemetria. Esta spec passa a descrever só a versão em R3F, mantida em `r3f.html`.
- **Planos:** [revisão 1, implementada](../plans/2026-10-07-parte-1-patio-3d.md) e [revisão 2, referências visuais](../plans/2026-10-07-parte-1-revisao-visual.md)
- **Repositório:** `fluxograma3d`

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
