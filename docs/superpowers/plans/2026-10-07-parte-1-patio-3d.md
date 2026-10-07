# Parte 1: Pátio de Subestação 3D, Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir no navegador uma cena 3D estilizada (visual de jogo de celular), vista de cima, do pátio de uma subestação com transformadores de potência, pessoas trabalhando e uma sala de monitoramento dentro de um prédio administrativo.

**Architecture:** App Vite + React + TypeScript com um único `Canvas` do React Three Fiber. O layout do pátio vive em dados (`src/data/yard.ts`), e a `Scene` monta equipamentos, condutores, prédio e pessoas a partir dele. A lógica que dá para testar (validação, curvas dos condutores, rotas, poses, fade do telhado, limites de câmera) fica em funções puras com Vitest; os componentes 3D são verificados visualmente.

**Tech Stack:** Vite, React, TypeScript, `three`, `@react-three/fiber`, `@react-three/drei`, Vitest.

**Spec:** [2026-10-07-parte-1-patio-3d-design.md](../specs/2026-10-07-parte-1-patio-3d-design.md)

## Global Constraints

- **Git:** nenhum comando git deve ser executado pelo agente (regra do usuário). Onde o fluxo padrão pediria um commit, o agente apenas lista os arquivos alterados e o usuário faz o commit.
- **Comentários:** no máximo 2 linhas, só para o que o código não deixa claro (armadilha de ordem de execução, número calibrado, constraint escondida). Nada de comentário que explique o que o código faz, nada de bloco explicativo acima de função/constante/classe.
- **Escala:** 1 unidade = 1 m nominal; Y para cima; chão em `y = 0`; pátio centrado na origem; pátio de cerca de 60 m × 40 m.
- **Idioma:** identificadores e comentários de código em inglês; textos da interface em português do Brasil.
- **Navegador:** WebGL2.
- **Desempenho:** 60 fps em notebook comum e em celular intermediário; `dpr` limitado a 2; `frameloop="always"`; sombras só da luz direcional principal.
- **Estilo:** sem texturas, sem HDRI, sem pós-processamento; cores chapadas (`MeshStandardMaterial` com `flatShading`), paleta saturada e curta; contorno fino só em peças grandes e únicas, atrás de uma flag.
- **Câmera:** perspectiva com FOV de 35°; inclinação a partir da vertical entre 25° e 60°; distância entre 10 e 130; pan limitado aos limites do pátio; rotação horizontal livre.
- **Terminais:** definidos só em `src/data/terminals.ts`; componentes e condutores usam esse arquivo.
- **Telhado:** o clique no prédio alterna `roofOpen`; o ponto de vista `monitoring-room` força `roofOpen = true`; fade de 0,4 s; com o telhado aberto, as paredes ficam baixas.
- **Pessoas:** 6 a 8 no total; operadores são criados pela `MonitoringRoom` (`building.operators`), não por `yard.workers`.
- **Fora do escopo:** modelos `.glb`, painel de informações, seleção de equipamentos (exceto o clique no prédio), animação de fluxo de energia, dados em tempo real.

## Review Focus

Entradas e condições que a spec implica mas não detalha, com o comportamento esperado. Cada linha tem o teste no task indicado.

1. **Ids de equipamento duplicados em `yard.ts`:** a segunda entrada é ignorada na validação, com erro claro, e a cena não quebra (Task 2).
2. **Tipo de equipamento sem componente:** renderiza o placeholder e avisa uma única vez no console (Task 7).
3. **Rota de caminhante degenerada (0 ou 1 ponto, pontos repetidos, velocidade menor ou igual a zero, tempo gigante):** nunca produz `NaN` nem derruba a cena (Task 4).
4. **Aba do navegador oculta por muito tempo, gerando um `delta` enorme:** o fade do telhado termina exatamente no alvo, sem ultrapassar (Task 10).
5. **Ponto de vista fora dos limites de inclinação, distância ou área de pan:** o teste falha, em vez de a câmera corrigir em silêncio (Task 12).

Também coberto: condutor de comprimento zero não gera `NaN` (Task 3) e operadores acima do número de cadeiras são limitados (Task 10).

---

## Mapa de arquivos

```
package.json  tsconfig.json  vite.config.ts  index.html  .gitignore
src/
  main.tsx                         # entrada React
  App.tsx                          # Canvas, estado do telhado e do tour
  index.css                        # estilos globais e do tour
  data/
    types.ts                       # tipos do modelo de dados
    terminals.ts                   # terminais por tipo de equipamento
    validate.ts (+ .test.ts)       # validação do Yard
    yard.ts (+ .test.ts)           # layout do pátio, pessoas e prédio
    cameraLimits.ts                # limites da câmera
    viewpoints.ts (+ .test.ts)     # pontos de vista do tour
  scene/
    Scene.tsx                      # monta a cena a partir de yard.ts
    materials.ts                   # paleta e materiais compartilhados
    primitives.tsx                 # Block e Cylinder
    flags.ts                       # OUTLINES_ENABLED
    environment/                   # Lighting, Ground, Fence, Trees
    equipment/                     # props, Insulator, 8 equipamentos, registry
    conductors/                    # curve.ts (+ test), Conductor.tsx
    building/                      # layout, fade, AdminBuilding, Roof, MonitoringRoom, Desk, Monitor, Chair
    people/                        # routes, poses, Worker
    camera/CameraRig.tsx
  ui/                              # TourControls, ErrorBoundary, webgl
```

---

### Task 1: Scaffold do projeto

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Interfaces:**
- Produces: scripts npm `dev`, `build`, `typecheck`, `test`; `App` exportado de `src/App.tsx`.

- [ ] **Step 1: Criar os arquivos de configuração**

`.gitignore`:

```
node_modules
dist
*.local
```

`package.json`:

```json
{
  "name": "fluxograma3d",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

`index.html`:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Subestação 3D</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/index.css`:

```css
html,
body,
#root {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: #bfe3ff;
  font-family: system-ui, sans-serif;
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (provisório, será substituído na Task 5):

```tsx
import { Canvas } from '@react-three/fiber';

export function App() {
  return (
    <Canvas camera={{ position: [6, 6, 6], fov: 35 }}>
      <ambientLight intensity={1.2} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Canvas>
  );
}
```

- [ ] **Step 2: Instalar as dependências**

Run:

```
npm install react react-dom three @react-three/fiber @react-three/drei
npm install -D typescript vite @vitejs/plugin-react vitest @types/react @types/react-dom @types/three
```

Expected: instalação sem erro. Rode `npm ls react @react-three/fiber` e confirme que as versões são compatíveis (o `@react-three/fiber` 9 exige React 19; o 8 exige React 18). Se houver conflito de peer dependency, instale a versão do R3F que combina com o React instalado.

- [ ] **Step 3: Verificar tipos, build e a configuração do Vitest**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm run build`
Expected: build concluído, pasta `dist/` criada.

Run: `npx vitest run --passWithNoTests`
Expected: sai com código 0 ("No test files found" é esperado nesta etapa).

- [ ] **Step 4: Verificação visual**

Run: `npm run dev`
Abra a URL mostrada (normalmente `http://localhost:5173`). Expected: um cubo laranja sobre fundo azul claro. Pare o servidor.

---

### Task 2: Modelo de dados, terminais e validação

**Files:**
- Create: `src/data/types.ts`, `src/data/terminals.ts`, `src/data/validate.ts`
- Test: `src/data/validate.test.ts`

**Interfaces:**
- Produces:
  - `types.ts`: `Vec3`, `EquipmentType`, `Equipment`, `TerminalRef`, `Connection`, `WorkerRole`, `WorkerSpec`, `Yard`, `Viewpoint`.
  - `terminals.ts`: `TERMINALS: Record<EquipmentType, Record<string, Vec3>>`.
  - `validate.ts`: `validateYard(yard: Yard): { validConnections: Connection[]; errors: string[] }`.

- [ ] **Step 1: Criar os tipos e os terminais**

`src/data/types.ts`:

```ts
export type Vec3 = [number, number, number];

export type EquipmentType =
  | 'transformer'
  | 'breaker'
  | 'disconnector'
  | 'ct'
  | 'pt'
  | 'arrester'
  | 'gantry'
  | 'busbar';

export interface Equipment {
  id: string;
  type: EquipmentType;
  position: Vec3;
  rotationY?: number;
}

export interface TerminalRef {
  equipmentId: string;
  terminal: string;
}

export interface Connection {
  from: TerminalRef;
  to: TerminalRef;
  sag?: number;
}

export type WorkerRole = 'walker' | 'inspector' | 'maintainer';

export interface WorkerSpec {
  id: string;
  role: WorkerRole;
  position: Vec3;
  route?: Vec3[];
  facing?: Vec3;
  vestColor?: string;
}

export interface Yard {
  equipment: Equipment[];
  connections: Connection[];
  workers: WorkerSpec[];
  building: {
    position: Vec3;
    rotationY?: number;
    operators: number;
  };
}

export interface Viewpoint {
  id: string;
  label: string;
  position: Vec3;
  target: Vec3;
  openRoof?: boolean;
}
```

`src/data/terminals.ts`:

```ts
import type { EquipmentType, Vec3 } from './types';

export const TERMINALS: Record<EquipmentType, Record<string, Vec3>> = {
  transformer: { hv1: [-1.5, 5.4, 0], lv1: [1.5, 4.4, 0] },
  breaker: { in: [-0.8, 3.4, 0], out: [0.8, 3.4, 0] },
  disconnector: { in: [-1, 3, 0], out: [1, 3, 0] },
  ct: { in: [-0.4, 3.2, 0], out: [0.4, 3.2, 0] },
  pt: { top: [0, 3.2, 0] },
  arrester: { top: [0, 3.4, 0] },
  gantry: { left: [-4, 6, 0], mid: [0, 6, 0], right: [4, 6, 0] },
  busbar: { a: [-12, 4, 0], tap1: [-8, 4, 0], tap2: [8, 4, 0], b: [12, 4, 0] },
};
```

- [ ] **Step 2: Escrever o teste que falha**

`src/data/validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { EquipmentType, Yard } from './types';
import { validateYard } from './validate';

const baseYard = (overrides: Partial<Yard> = {}): Yard => ({
  equipment: [
    { id: 't1', type: 'transformer', position: [0, 0, 0] },
    { id: 'bb1', type: 'busbar', position: [0, 0, 10] },
  ],
  connections: [],
  workers: [],
  building: { position: [40, 0, 0], operators: 0 },
  ...overrides,
});

describe('validateYard', () => {
  it('keeps connections whose endpoints exist', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.errors).toEqual([]);
    expect(result.validConnections).toHaveLength(1);
  });

  it('drops a connection to unknown equipment', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'ghost', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.validConnections).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('unknown equipment "ghost"');
  });

  it('drops a connection to an unknown terminal', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'nope' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.validConnections).toHaveLength(0);
    expect(result.errors[0]).toContain('has no terminal "nope"');
  });

  it('does not accept prototype keys as terminals', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'toString' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    expect(validateYard(yard).validConnections).toHaveLength(0);
  });

  it('reports duplicate equipment ids', () => {
    const yard = baseYard({
      equipment: [
        { id: 't1', type: 'transformer', position: [0, 0, 0] },
        { id: 't1', type: 'busbar', position: [0, 0, 10] },
      ],
    });
    const result = validateYard(yard);
    expect(result.errors).toContain('Duplicate equipment id "t1"');
  });

  it('reports unknown equipment types and drops their connections', () => {
    const yard = baseYard({
      equipment: [
        { id: 'x', type: 'crane' as EquipmentType, position: [0, 0, 0] },
        { id: 'bb1', type: 'busbar', position: [0, 0, 10] },
      ],
      connections: [{ from: { equipmentId: 'x', terminal: 'top' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.errors.some((error) => error.includes('Unknown equipment type "crane"'))).toBe(true);
    expect(result.validConnections).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run src/data/validate.test.ts`
Expected: FAIL com erro de módulo não encontrado (`./validate`).

- [ ] **Step 4: Implementar `validate.ts`**

`src/data/validate.ts`:

```ts
import { TERMINALS } from './terminals';
import type { Connection, Equipment, EquipmentType, TerminalRef, Vec3, Yard } from './types';

export interface YardValidation {
  validConnections: Connection[];
  errors: string[];
}

function terminalsOf(type: string): Record<string, Vec3> | undefined {
  return Object.hasOwn(TERMINALS, type) ? TERMINALS[type as EquipmentType] : undefined;
}

export function validateYard(yard: Yard): YardValidation {
  const errors: string[] = [];
  const byId = new Map<string, Equipment>();

  for (const item of yard.equipment) {
    if (byId.has(item.id)) {
      errors.push(`Duplicate equipment id "${item.id}"`);
      continue;
    }
    byId.set(item.id, item);
    if (!terminalsOf(item.type)) errors.push(`Unknown equipment type "${item.type}" on "${item.id}"`);
  }

  const endpointProblem = (ref: TerminalRef): string | null => {
    const item = byId.get(ref.equipmentId);
    if (!item) return `unknown equipment "${ref.equipmentId}"`;
    const terminals = terminalsOf(item.type);
    if (!terminals) return `equipment "${item.id}" has unknown type "${item.type}"`;
    if (!Object.hasOwn(terminals, ref.terminal)) return `equipment "${item.id}" has no terminal "${ref.terminal}"`;
    return null;
  };

  const validConnections = yard.connections.filter((connection) => {
    const label = `${connection.from.equipmentId}.${connection.from.terminal} -> ${connection.to.equipmentId}.${connection.to.terminal}`;
    const problems = [endpointProblem(connection.from), endpointProblem(connection.to)].filter(
      (problem): problem is string => problem !== null,
    );
    for (const problem of problems) errors.push(`Connection ${label}: ${problem}`);
    return problems.length === 0;
  });

  return { validConnections, errors };
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run src/data/validate.test.ts`
Expected: 6 testes passando.

Run: `npm run typecheck`
Expected: sem erros.

---

### Task 3: Curvas dos condutores (funções puras)

**Files:**
- Create: `src/scene/conductors/curve.ts`
- Test: `src/scene/conductors/curve.test.ts`

**Interfaces:**
- Consumes: `TERMINALS`, `Equipment`, `Vec3` (Task 2).
- Produces:
  - `terminalWorldPosition(equipment: Equipment, terminal: string): Vec3` (aplica posição e `rotationY`; lança erro se o terminal não existir).
  - `sagPoints(from: Vec3, to: Vec3, sag: number, segments?: number): Vec3[]` (`segments + 1` pontos, padrão 24).

- [ ] **Step 1: Escrever o teste que falha**

`src/scene/conductors/curve.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Equipment, Vec3 } from '../../data/types';
import { sagPoints, terminalWorldPosition } from './curve';

const transformer = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 't1',
  type: 'transformer',
  position: [10, 0, 5],
  ...overrides,
});

describe('terminalWorldPosition', () => {
  it('adds the equipment position to the local terminal', () => {
    expect(terminalWorldPosition(transformer(), 'lv1')).toEqual([11.5, 4.4, 5]);
  });

  it('rotates around Y before translating', () => {
    const [x, y, z] = terminalWorldPosition(transformer({ rotationY: Math.PI / 2 }), 'lv1');
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(4.4);
    expect(z).toBeCloseTo(3.5);
  });

  it('throws for a terminal that does not exist', () => {
    expect(() => terminalWorldPosition(transformer(), 'nope')).toThrow('no terminal "nope"');
  });

  it('throws for prototype keys', () => {
    expect(() => terminalWorldPosition(transformer(), 'toString')).toThrow('no terminal "toString"');
  });
});

describe('sagPoints', () => {
  const from: Vec3 = [0, 5, 0];
  const to: Vec3 = [10, 5, 0];

  it('returns segments + 1 points that start and end at the terminals', () => {
    const points = sagPoints(from, to, 1, 10);
    expect(points).toHaveLength(11);
    expect(points[0]).toEqual(from);
    expect(points[10]).toEqual(to);
  });

  it('defaults to 24 segments', () => {
    expect(sagPoints(from, to, 1)).toHaveLength(25);
  });

  it('drops by the sag at the midpoint', () => {
    const points = sagPoints(from, to, 1, 10);
    expect(points[5][1]).toBeCloseTo(4);
  });

  it('is a straight line with zero sag', () => {
    const points = sagPoints(from, to, 0, 4);
    expect(points.map((point) => point[1])).toEqual([5, 5, 5, 5, 5]);
  });

  it('never produces NaN when both ends are the same point', () => {
    const points = sagPoints(from, from, 0.6);
    expect(points.every((point) => point.every(Number.isFinite))).toBe(true);
  });

  it('treats a segment count below 1 as 1', () => {
    expect(sagPoints(from, to, 1, 0)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/scene/conductors/curve.test.ts`
Expected: FAIL com módulo `./curve` não encontrado.

- [ ] **Step 3: Implementar**

`src/scene/conductors/curve.ts`:

```ts
import { TERMINALS } from '../../data/terminals';
import type { Equipment, Vec3 } from '../../data/types';

export function terminalWorldPosition(equipment: Equipment, terminal: string): Vec3 {
  const terminals = TERMINALS[equipment.type];
  if (!Object.hasOwn(terminals, terminal)) {
    throw new Error(`Equipment "${equipment.id}" has no terminal "${terminal}"`);
  }
  const [x, y, z] = terminals[terminal];
  const [px, py, pz] = equipment.position;
  const angle = equipment.rotationY ?? 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [px + x * cos + z * sin, py + y, pz - x * sin + z * cos];
}

export function sagPoints(from: Vec3, to: Vec3, sag: number, segments = 24): Vec3[] {
  const count = Math.max(1, Math.floor(segments));
  const points: Vec3[] = [];
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    const drop = 4 * sag * t * (1 - t);
    points.push([
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t - drop,
      from[2] + (to[2] - from[2]) * t,
    ]);
  }
  return points;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/scene/conductors/curve.test.ts`
Expected: 10 testes passando.

---

### Task 4: Rotas dos caminhantes (funções puras)

**Files:**
- Create: `src/scene/people/routes.ts`
- Test: `src/scene/people/routes.test.ts`

**Interfaces:**
- Consumes: `Vec3` (Task 2).
- Produces:
  - `RouteSample = { position: Vec3; heading: number; moving: boolean }`
  - `sampleRoute(route: readonly Vec3[], options: { speed: number; pause: number }, time: number): RouteSample` (rota fechada: do último ponto volta ao primeiro; `heading` é o ângulo em Y com 0 apontando para +Z).
  - `headingBetween(from: Vec3, to: Vec3): number`

- [ ] **Step 1: Escrever o teste que falha**

`src/scene/people/routes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../data/types';
import { headingBetween, sampleRoute } from './routes';

const OUT_AND_BACK: Vec3[] = [
  [0, 0, 0],
  [10, 0, 0],
];
const OPTIONS = { speed: 2, pause: 1 };

describe('sampleRoute', () => {
  it('waits at the first point before moving', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, 0);
    expect(sample.position).toEqual([0, 0, 0]);
    expect(sample.moving).toBe(false);
  });

  it('walks toward the next point after the pause', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, 3.5);
    expect(sample.position[0]).toBeCloseTo(5);
    expect(sample.moving).toBe(true);
    expect(sample.heading).toBeCloseTo(Math.PI / 2);
  });

  it('pauses at the far point and then returns facing the other way', () => {
    const paused = sampleRoute(OUT_AND_BACK, OPTIONS, 6.5);
    expect(paused.position[0]).toBeCloseTo(10);
    expect(paused.moving).toBe(false);

    const back = sampleRoute(OUT_AND_BACK, OPTIONS, 9.5);
    expect(back.position[0]).toBeCloseTo(5);
    expect(back.heading).toBeCloseTo(-Math.PI / 2);
  });

  it('loops with a period equal to the full cycle', () => {
    const first = sampleRoute(OUT_AND_BACK, OPTIONS, 3.5);
    const again = sampleRoute(OUT_AND_BACK, OPTIONS, 3.5 + 12);
    expect(again.position[0]).toBeCloseTo(first.position[0]);
  });

  it('stays finite and inside the route for a huge elapsed time', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, 1e7 + 0.3);
    expect(Number.isFinite(sample.position[0])).toBe(true);
    expect(sample.position[0]).toBeGreaterThanOrEqual(0);
    expect(sample.position[0]).toBeLessThanOrEqual(10);
  });

  it('handles negative time by wrapping', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, -1);
    expect(Number.isFinite(sample.position[0])).toBe(true);
  });

  it('stays at the only point of a one-point route', () => {
    const sample = sampleRoute([[3, 0, 4]], OPTIONS, 5);
    expect(sample.position).toEqual([3, 0, 4]);
    expect(sample.moving).toBe(false);
  });

  it('throws for an empty route', () => {
    expect(() => sampleRoute([], OPTIONS, 0)).toThrow('at least one point');
  });

  it('throws for a speed that is not positive', () => {
    expect(() => sampleRoute(OUT_AND_BACK, { speed: 0, pause: 1 }, 0)).toThrow('speed');
    expect(() => sampleRoute(OUT_AND_BACK, { speed: -1, pause: 1 }, 0)).toThrow('speed');
  });

  it('never returns NaN when consecutive points repeat', () => {
    const route: Vec3[] = [
      [0, 0, 0],
      [0, 0, 0],
      [4, 0, 0],
    ];
    for (let time = 0; time < 30; time += 0.37) {
      const sample = sampleRoute(route, OPTIONS, time);
      expect(sample.position.every(Number.isFinite)).toBe(true);
      expect(Number.isFinite(sample.heading)).toBe(true);
    }
  });

  it('stays still when the whole route is one repeated point with no pause', () => {
    const route: Vec3[] = [
      [1, 0, 1],
      [1, 0, 1],
    ];
    const sample = sampleRoute(route, { speed: 1, pause: 0 }, 7);
    expect(sample.position).toEqual([1, 0, 1]);
    expect(sample.moving).toBe(false);
  });
});

describe('headingBetween', () => {
  it('is 0 when the target is straight ahead on +Z', () => {
    expect(headingBetween([0, 0, 0], [0, 0, 5])).toBe(0);
  });

  it('is PI/2 when the target is on +X', () => {
    expect(headingBetween([0, 0, 0], [5, 0, 0])).toBeCloseTo(Math.PI / 2);
  });

  it('is 0 when both points are the same', () => {
    expect(headingBetween([2, 0, 2], [2, 0, 2])).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/scene/people/routes.test.ts`
Expected: FAIL com módulo `./routes` não encontrado.

- [ ] **Step 3: Implementar**

`src/scene/people/routes.ts`:

```ts
import type { Vec3 } from '../../data/types';

export interface RouteSample {
  position: Vec3;
  heading: number;
  moving: boolean;
}

export interface RouteOptions {
  speed: number;
  pause: number;
}

export function headingBetween(from: Vec3, to: Vec3): number {
  return Math.atan2(to[0] - from[0], to[2] - from[2]);
}

function lerp(from: Vec3, to: Vec3, t: number): Vec3 {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

export function sampleRoute(route: readonly Vec3[], { speed, pause }: RouteOptions, time: number): RouteSample {
  if (route.length === 0) throw new Error('Route needs at least one point');
  if (!(speed > 0)) throw new Error('Route speed must be positive');
  if (route.length === 1) return { position: route[0], heading: 0, moving: false };

  const wait = Math.max(0, pause);
  const legs = route.map((from, index) => {
    const to = route[(index + 1) % route.length];
    const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    return { from, to, moveTime: length / speed, heading: headingBetween(from, to) };
  });

  const cycle = legs.reduce((total, leg) => total + wait + leg.moveTime, 0);
  if (cycle === 0) return { position: route[0], heading: 0, moving: false };

  let remaining = ((time % cycle) + cycle) % cycle;
  for (const leg of legs) {
    if (remaining < wait) return { position: leg.from, heading: leg.heading, moving: false };
    remaining -= wait;
    if (remaining < leg.moveTime) {
      return { position: lerp(leg.from, leg.to, remaining / leg.moveTime), heading: leg.heading, moving: true };
    }
    remaining -= leg.moveTime;
  }
  return { position: legs[0].from, heading: legs[0].heading, moving: false };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/scene/people/routes.test.ts`
Expected: 14 testes passando.

---

### Task 5: Materiais, primitivas, luz e chão

**Files:**
- Create: `src/scene/materials.ts`, `src/scene/primitives.tsx`, `src/scene/environment/Lighting.tsx`, `src/scene/environment/Ground.tsx`, `src/scene/Scene.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces:
  - `PALETTE` e `MATERIALS: Record<keyof typeof PALETTE, MeshStandardMaterial>`; `vestMaterial(color: string): MeshStandardMaterial`.
  - `Block({ size: Vec3; position: Vec3; material: Material; radius?: number; rotation?: Vec3 })`
  - `Cylinder({ radius: number; height: number; position: Vec3; material: Material; rotation?: Vec3; segments?: number })`
  - `Lighting()`, `Ground()`, `Scene()` (por enquanto só luz e chão).

- [ ] **Step 1: Criar `materials.ts`**

`src/scene/materials.ts`:

```ts
import { MeshStandardMaterial } from 'three';

export const PALETTE = {
  sky: '#bfe3ff',
  transformer: '#2a9bb8',
  accent: '#f5a623',
  steel: '#c3cbd4',
  porcelain: '#b98a5e',
  aluminum: '#e4e9ee',
  gravel: '#b7ad9a',
  grass: '#7bc65a',
  fence: '#8a949e',
  trunk: '#8b5a2b',
  leaves: '#4caf50',
  wall: '#f1e6d3',
  roof: '#d9534f',
  floor: '#d8d2c4',
  window: '#9fd8f2',
  deskTop: '#9c6b3f',
  chair: '#3d4a5c',
  panel: '#243447',
  screenOn: '#6fe3ff',
  skin: '#f1c7a1',
  pants: '#3c4b66',
  helmet: '#ffd23f',
} as const;

type MaterialName = keyof typeof PALETTE;

const flat = (color: string) => new MeshStandardMaterial({ color, flatShading: true, roughness: 0.9 });

export const MATERIALS = Object.fromEntries(
  (Object.keys(PALETTE) as MaterialName[]).map((name) => [name, flat(PALETTE[name])]),
) as Record<MaterialName, MeshStandardMaterial>;

MATERIALS.screenOn.emissive.set(PALETTE.screenOn);
MATERIALS.screenOn.emissiveIntensity = 0.8;

const vestCache = new Map<string, MeshStandardMaterial>();

export function vestMaterial(color: string): MeshStandardMaterial {
  let material = vestCache.get(color);
  if (!material) {
    material = flat(color);
    vestCache.set(color, material);
  }
  return material;
}
```

- [ ] **Step 2: Criar `primitives.tsx`**

`src/scene/primitives.tsx`:

```tsx
import { BoxGeometry, type Material } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Vec3 } from '../data/types';

const boxCache = new Map<string, BoxGeometry>();

function boxGeometry(size: Vec3, radius: number): BoxGeometry {
  const key = `${size.join('x')}@${radius}`;
  let geometry = boxCache.get(key);
  if (!geometry) {
    geometry =
      radius > 0 ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, radius) : new BoxGeometry(size[0], size[1], size[2]);
    boxCache.set(key, geometry);
  }
  return geometry;
}

interface BlockProps {
  size: Vec3;
  position: Vec3;
  material: Material;
  radius?: number;
  rotation?: Vec3;
}

export function Block({ size, position, material, radius = 0, rotation }: BlockProps) {
  return (
    <mesh
      geometry={boxGeometry(size, radius)}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  );
}

interface CylinderProps {
  radius: number;
  height: number;
  position: Vec3;
  material: Material;
  rotation?: Vec3;
  segments?: number;
}

export function Cylinder({ radius, height, position, material, rotation, segments = 12 }: CylinderProps) {
  return (
    <mesh material={material} position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, segments]} />
    </mesh>
  );
}
```

O raio de um `Block` arredondado deve ser menor que metade da menor dimensão.

- [ ] **Step 3: Criar luz, chão e a cena mínima**

`src/scene/environment/Lighting.tsx`:

```tsx
import { PALETTE } from '../materials';

export function Lighting() {
  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <fog attach="fog" args={[PALETTE.sky, 120, 220]} />
      <hemisphereLight args={['#ffffff', PALETTE.grass, 0.9]} />
      <directionalLight
        position={[-30, 50, 30]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />
    </>
  );
}
```

`src/scene/environment/Ground.tsx`:

```tsx
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

export function Ground() {
  return (
    <>
      <Block size={[240, 0.1, 240]} position={[0, -0.1, 0]} material={MATERIALS.grass} />
      <Block size={[60, 0.1, 40]} position={[0, -0.05, 0]} material={MATERIALS.gravel} />
    </>
  );
}
```

`src/scene/Scene.tsx`:

```tsx
import { Ground } from './environment/Ground';
import { Lighting } from './environment/Lighting';

export function Scene() {
  return (
    <>
      <Lighting />
      <Ground />
    </>
  );
}
```

`src/App.tsx` (provisório com `OrbitControls`; a Task 12 troca pela câmera final):

```tsx
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene/Scene';

export function App() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [-44, 67, 47], fov: 35, near: 1, far: 400 }}>
      <Scene />
      <OrbitControls />
    </Canvas>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck`
Expected: sem erros. Se `three/addons/geometries/RoundedBoxGeometry.js` não resolver os tipos, confirme que `@types/three` está instalado.

Run: `npm run dev`
Expected: chão de brita retangular cercado de grama, céu azul claro e névoa leve na distância. Pare o servidor.

---

### Task 6: Isolador e transformador de potência

**Files:**
- Create: `src/scene/equipment/props.ts`, `src/scene/equipment/Insulator.tsx`, `src/scene/equipment/PowerTransformer.tsx`
- Modify: `src/scene/Scene.tsx` (temporário, será reescrito na Task 8)

**Interfaces:**
- Consumes: `TERMINALS` (Task 2), `MATERIALS`, `Block`, `Cylinder` (Task 5).
- Produces:
  - `EquipmentProps = { position: Vec3; rotationY?: number }`
  - `Insulator({ position?: Vec3; height: number; radius?: number; discs?: number })`: coluna com a base em `position` e o topo em `position.y + height`.
  - `PowerTransformer(props: EquipmentProps)`: buchas AT/BT terminam exatamente nos terminais `hv1` e `lv1`.

- [ ] **Step 1: Criar props e isolador**

`src/scene/equipment/props.ts`:

```ts
import type { Vec3 } from '../../data/types';

export interface EquipmentProps {
  position: Vec3;
  rotationY?: number;
}
```

`src/scene/equipment/Insulator.tsx`:

```tsx
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';

interface InsulatorProps {
  position?: Vec3;
  height: number;
  radius?: number;
  discs?: number;
}

export function Insulator({ position = [0, 0, 0], height, radius = 0.22, discs = 4 }: InsulatorProps) {
  const step = height / (discs + 1);
  return (
    <group position={position}>
      <Cylinder radius={radius} height={height} position={[0, height / 2, 0]} material={MATERIALS.porcelain} segments={10} />
      {Array.from({ length: discs }, (_, index) => (
        <Cylinder
          key={index}
          radius={radius * 2}
          height={step * 0.35}
          position={[0, step * (index + 1), 0]}
          material={MATERIALS.porcelain}
          segments={10}
        />
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Criar o transformador**

`src/scene/equipment/PowerTransformer.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_HEIGHT = 0.4;
const TANK_TOP = 3.4;

export function PowerTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const { hv1, lv1 } = TERMINALS.transformer;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[5.6, BASE_HEIGHT, 4.2]} position={[0, BASE_HEIGHT / 2, 0]} material={MATERIALS.steel} />
      <Block
        size={[5, TANK_TOP - BASE_HEIGHT, 3.5]}
        position={[0, (BASE_HEIGHT + TANK_TOP) / 2, 0]}
        material={MATERIALS.transformer}
        radius={0.25}
      />
      {[-1, 1].map((side) => (
        <Block
          key={side}
          size={[3.6, 2.2, 0.6]}
          position={[0, 1.9, side * 2.05]}
          material={MATERIALS.transformer}
          radius={0.1}
        />
      ))}
      <Cylinder
        radius={0.6}
        height={2.6}
        position={[0, TANK_TOP + 0.8, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MATERIALS.accent}
      />
      <Insulator position={[hv1[0], TANK_TOP, hv1[2]]} height={hv1[1] - TANK_TOP} />
      <Insulator position={[lv1[0], TANK_TOP, lv1[2]]} height={lv1[1] - TANK_TOP} />
    </group>
  );
}
```

- [ ] **Step 3: Verificar visualmente**

Edite `src/scene/Scene.tsx` temporariamente para renderizar um transformador no centro:

```tsx
import { Ground } from './environment/Ground';
import { Lighting } from './environment/Lighting';
import { PowerTransformer } from './equipment/PowerTransformer';

export function Scene() {
  return (
    <>
      <Lighting />
      <Ground />
      <PowerTransformer position={[0, 0, 0]} />
    </>
  );
}
```

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm run dev` e aproxime a câmera do transformador.
Expected: tanque azul-esverdeado de cantos arredondados, radiadores nos dois lados, conservador laranja no topo e duas buchas com discos (a de AT mais alta, à esquerda). Pare o servidor.

---

### Task 7: Demais equipamentos e registro

**Files:**
- Create: `src/scene/equipment/CircuitBreaker.tsx`, `Disconnector.tsx`, `CurrentTransformer.tsx`, `PotentialTransformer.tsx`, `SurgeArrester.tsx`, `Gantry.tsx`, `Busbar.tsx`, `registry.tsx` (todos em `src/scene/equipment/`)
- Test: `src/scene/equipment/registry.test.ts`

**Interfaces:**
- Consumes: `EquipmentProps`, `Insulator`, `PowerTransformer` (Task 6); `TERMINALS`, `MATERIALS`, `Block`, `Cylinder`.
- Produces:
  - Componentes `CircuitBreaker`, `Disconnector`, `CurrentTransformer`, `PotentialTransformer`, `SurgeArrester`, `Gantry`, `Busbar`, todos `(props: EquipmentProps)`.
  - `PlaceholderEquipment(props: EquipmentProps)`
  - `resolveEquipmentComponent(type: string): ComponentType<EquipmentProps>` (devolve o placeholder para tipo desconhecido e avisa uma vez por tipo no console).

- [ ] **Step 1: Criar os componentes**

`src/scene/equipment/CircuitBreaker.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.5;

export function CircuitBreaker({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.breaker;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2.4, BASE_TOP, 1]} position={[0, BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[inlet[0], BASE_TOP, inlet[2]]} height={inlet[1] - BASE_TOP} />
      <Insulator position={[outlet[0], BASE_TOP, outlet[2]]} height={outlet[1] - BASE_TOP} />
      <Block size={[0.8, 0.9, 0.6]} position={[0, 0.95, -0.8]} material={MATERIALS.accent} radius={0.08} />
    </group>
  );
}
```

`src/scene/equipment/Disconnector.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.4;

export function Disconnector({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.disconnector;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2.6, BASE_TOP, 0.6]} position={[0, BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[inlet[0], BASE_TOP, inlet[2]]} height={inlet[1] - BASE_TOP} />
      <Insulator position={[outlet[0], BASE_TOP, outlet[2]]} height={outlet[1] - BASE_TOP} />
      <Block size={[outlet[0] - inlet[0], 0.12, 0.12]} position={[0, inlet[1] + 0.06, 0]} material={MATERIALS.aluminum} />
    </group>
  );
}
```

`src/scene/equipment/CurrentTransformer.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.5;
const HEAD_HEIGHT = 0.6;

export function CurrentTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const headY = TERMINALS.ct.in[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[1, PEDESTAL, 1]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[0, PEDESTAL, 0]} height={headY - HEAD_HEIGHT / 2 - PEDESTAL} radius={0.28} />
      <Block size={[1, HEAD_HEIGHT, 0.7]} position={[0, headY, 0]} material={MATERIALS.accent} radius={0.12} />
    </group>
  );
}
```

`src/scene/equipment/PotentialTransformer.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.5;
const CAP_HEIGHT = 0.3;

export function PotentialTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const topY = TERMINALS.pt.top[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[1.2, PEDESTAL, 1.2]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[0, PEDESTAL, 0]} height={topY - PEDESTAL - CAP_HEIGHT} radius={0.3} />
      <Cylinder radius={0.4} height={CAP_HEIGHT} position={[0, topY - CAP_HEIGHT / 2, 0]} material={MATERIALS.accent} />
    </group>
  );
}
```

`src/scene/equipment/SurgeArrester.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.3;
const CAP_HEIGHT = 0.2;

export function SurgeArrester({ position, rotationY = 0 }: EquipmentProps) {
  const topY = TERMINALS.arrester.top[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[0.8, PEDESTAL, 0.8]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[0, PEDESTAL, 0]} height={topY - PEDESTAL - CAP_HEIGHT / 2} radius={0.16} discs={6} />
      <Cylinder radius={0.12} height={CAP_HEIGHT} position={[0, topY - CAP_HEIGHT / 2, 0]} material={MATERIALS.accent} />
    </group>
  );
}
```

`src/scene/equipment/Gantry.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import type { EquipmentProps } from './props';

const BEAM_THICKNESS = 0.5;

export function Gantry({ position, rotationY = 0 }: EquipmentProps) {
  const { left, right } = TERMINALS.gantry;
  const height = left[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[0.5, height, 0.5]} position={[left[0], height / 2, 0]} material={MATERIALS.steel} />
      <Block size={[0.5, height, 0.5]} position={[right[0], height / 2, 0]} material={MATERIALS.steel} />
      <Block
        size={[right[0] - left[0] + 0.5, BEAM_THICKNESS, BEAM_THICKNESS]}
        position={[0, height - BEAM_THICKNESS / 2, 0]}
        material={MATERIALS.steel}
      />
    </group>
  );
}
```

`src/scene/equipment/Busbar.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const TUBE_RADIUS = 0.2;
const SUPPORT_COUNT = 7;

export function Busbar({ position, rotationY = 0 }: EquipmentProps) {
  const { a, b } = TERMINALS.busbar;
  const length = b[0] - a[0];
  return (
    <group position={position} rotation-y={rotationY}>
      <Cylinder
        radius={TUBE_RADIUS}
        height={length}
        position={[0, a[1], 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={MATERIALS.aluminum}
        segments={10}
      />
      {Array.from({ length: SUPPORT_COUNT }, (_, index) => (
        <Insulator
          key={index}
          position={[a[0] + (length * index) / (SUPPORT_COUNT - 1), 0, 0]}
          height={a[1] - TUBE_RADIUS}
          radius={0.2}
        />
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Escrever o teste do registro (falha)**

`src/scene/equipment/registry.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { TERMINALS } from '../../data/terminals';
import { PlaceholderEquipment, resolveEquipmentComponent } from './registry';

describe('resolveEquipmentComponent', () => {
  it('has a dedicated component for every equipment type', () => {
    for (const type of Object.keys(TERMINALS)) {
      expect(resolveEquipmentComponent(type)).not.toBe(PlaceholderEquipment);
    }
  });

  it('falls back to the placeholder and warns once per unknown type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveEquipmentComponent('crane')).toBe(PlaceholderEquipment);
    expect(resolveEquipmentComponent('crane')).toBe(PlaceholderEquipment);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('does not treat prototype keys as equipment types', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveEquipmentComponent('toString')).toBe(PlaceholderEquipment);
    warn.mockRestore();
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npx vitest run src/scene/equipment/registry.test.ts`
Expected: FAIL com módulo `./registry` não encontrado.

- [ ] **Step 4: Implementar o registro**

`src/scene/equipment/registry.tsx`:

```tsx
import type { ComponentType } from 'react';
import type { EquipmentType } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Busbar } from './Busbar';
import { CircuitBreaker } from './CircuitBreaker';
import { CurrentTransformer } from './CurrentTransformer';
import { Disconnector } from './Disconnector';
import { Gantry } from './Gantry';
import { PotentialTransformer } from './PotentialTransformer';
import { PowerTransformer } from './PowerTransformer';
import type { EquipmentProps } from './props';
import { SurgeArrester } from './SurgeArrester';

export function PlaceholderEquipment({ position, rotationY = 0 }: EquipmentProps) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2, 2, 2]} position={[0, 1, 0]} material={MATERIALS.accent} />
    </group>
  );
}

const EQUIPMENT_COMPONENTS: Record<EquipmentType, ComponentType<EquipmentProps>> = {
  transformer: PowerTransformer,
  breaker: CircuitBreaker,
  disconnector: Disconnector,
  ct: CurrentTransformer,
  pt: PotentialTransformer,
  arrester: SurgeArrester,
  gantry: Gantry,
  busbar: Busbar,
};

const warned = new Set<string>();

export function resolveEquipmentComponent(type: string): ComponentType<EquipmentProps> {
  if (Object.hasOwn(EQUIPMENT_COMPONENTS, type)) return EQUIPMENT_COMPONENTS[type as EquipmentType];
  if (!warned.has(type)) {
    warned.add(type);
    console.warn(`No component for equipment type "${type}"; rendering a placeholder`);
  }
  return PlaceholderEquipment;
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run src/scene/equipment/registry.test.ts`
Expected: 3 testes passando. Se a importação falhar por causa de `window`/`document` (módulos do three ou do drei em ambiente node), anote o erro e siga a contingência da Task 13, Step 4.

Run: `npm run typecheck`
Expected: sem erros.

---

### Task 8: Layout do pátio, condutores e cena

**Files:**
- Create: `src/data/yard.ts`, `src/scene/conductors/Conductor.tsx`
- Modify: `src/scene/Scene.tsx` (reescrita completa)
- Test: `src/data/yard.test.ts`

**Interfaces:**
- Consumes: `Yard` (Task 2), `validateYard` (Task 2), `terminalWorldPosition`, `sagPoints` (Task 3), `resolveEquipmentComponent` (Task 7), `MATERIALS`.
- Produces:
  - `YARD: Yard` e `YARD_SIZE = { width: 60, depth: 40 }` em `src/data/yard.ts`.
  - `Conductor({ from: Vec3; to: Vec3; sag?: number })` e `DEFAULT_SAG`.
  - `Scene()` renderizando luz, chão, equipamentos e condutores.

- [ ] **Step 1: Criar `yard.ts`**

`src/data/yard.ts`:

```ts
import type { Yard } from './types';

export const YARD_SIZE = { width: 60, depth: 40 } as const;

const CHAIN_ROTATION = -Math.PI / 2;

export const YARD: Yard = {
  equipment: [
    { id: 'g1', type: 'gantry', position: [0, 0, -17] },
    { id: 'd1', type: 'disconnector', position: [0, 0, -11], rotationY: CHAIN_ROTATION },
    { id: 'pt1', type: 'pt', position: [3, 0, -9] },
    { id: 'b1', type: 'breaker', position: [0, 0, -7], rotationY: CHAIN_ROTATION },
    { id: 'ct1', type: 'ct', position: [0, 0, -3.5], rotationY: CHAIN_ROTATION },
    { id: 't1', type: 'transformer', position: [-8, 0, 3] },
    { id: 't2', type: 'transformer', position: [8, 0, 3], rotationY: Math.PI },
    { id: 'sa1', type: 'arrester', position: [-12, 0, 1] },
    { id: 'sa2', type: 'arrester', position: [12, 0, 1] },
    { id: 'bb1', type: 'busbar', position: [0, 0, 13] },
  ],
  connections: [
    { from: { equipmentId: 'g1', terminal: 'mid' }, to: { equipmentId: 'd1', terminal: 'in' }, sag: 1 },
    { from: { equipmentId: 'd1', terminal: 'out' }, to: { equipmentId: 'b1', terminal: 'in' }, sag: 0.3 },
    { from: { equipmentId: 'd1', terminal: 'out' }, to: { equipmentId: 'pt1', terminal: 'top' }, sag: 0.3 },
    { from: { equipmentId: 'b1', terminal: 'out' }, to: { equipmentId: 'ct1', terminal: 'in' }, sag: 0.3 },
    { from: { equipmentId: 'ct1', terminal: 'out' }, to: { equipmentId: 't1', terminal: 'hv1' }, sag: 0.8 },
    { from: { equipmentId: 'ct1', terminal: 'out' }, to: { equipmentId: 't2', terminal: 'hv1' }, sag: 0.8 },
    { from: { equipmentId: 't1', terminal: 'hv1' }, to: { equipmentId: 'sa1', terminal: 'top' }, sag: 0.2 },
    { from: { equipmentId: 't2', terminal: 'hv1' }, to: { equipmentId: 'sa2', terminal: 'top' }, sag: 0.2 },
    { from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap1' }, sag: 0.8 },
    { from: { equipmentId: 't2', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap2' }, sag: 0.8 },
  ],
  workers: [
    {
      id: 'w-walker-1',
      role: 'walker',
      position: [-14, 0, 9],
      route: [
        [-14, 0, 9],
        [14, 0, 9],
      ],
      vestColor: '#ff7a1a',
    },
    {
      id: 'w-walker-2',
      role: 'walker',
      position: [-6, 0, -14],
      route: [
        [-6, 0, -14],
        [6, 0, -14],
        [6, 0, -5],
        [-6, 0, -5],
      ],
      vestColor: '#ffd23f',
    },
    { id: 'w-inspector-1', role: 'inspector', position: [-8, 0, -0.3], facing: [-8, 0, 3], vestColor: '#ff7a1a' },
    { id: 'w-inspector-2', role: 'inspector', position: [8, 0, -0.3], facing: [8, 0, 3], vestColor: '#ffd23f' },
    { id: 'w-maintainer-1', role: 'maintainer', position: [-12, 0, -1.5], facing: [-12, 0, 1], vestColor: '#ff7a1a' },
  ],
  building: { position: [38, 0, 0], rotationY: -Math.PI / 2, operators: 3 },
};
```

- [ ] **Step 2: Escrever o teste do pátio**

`src/data/yard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateYard } from './validate';
import { YARD, YARD_SIZE } from './yard';

const HALF_WIDTH = YARD_SIZE.width / 2;
const HALF_DEPTH = YARD_SIZE.depth / 2;

describe('YARD', () => {
  it('has no validation errors and keeps every connection', () => {
    const result = validateYard(YARD);
    expect(result.errors).toEqual([]);
    expect(result.validConnections).toHaveLength(YARD.connections.length);
  });

  it('has two power transformers', () => {
    expect(YARD.equipment.filter((item) => item.type === 'transformer')).toHaveLength(2);
  });

  it('keeps every piece of equipment inside the fence', () => {
    for (const { id, position } of YARD.equipment) {
      expect(Math.abs(position[0]), id).toBeLessThanOrEqual(HALF_WIDTH);
      expect(Math.abs(position[2]), id).toBeLessThanOrEqual(HALF_DEPTH);
    }
  });

  it('keeps worker positions, routes and facing targets inside the fence', () => {
    for (const worker of YARD.workers) {
      const points = [worker.position, ...(worker.route ?? []), ...(worker.facing ? [worker.facing] : [])];
      for (const point of points) {
        expect(Math.abs(point[0]), worker.id).toBeLessThanOrEqual(HALF_WIDTH);
        expect(Math.abs(point[2]), worker.id).toBeLessThanOrEqual(HALF_DEPTH);
      }
    }
  });

  it('has between 6 and 8 people counting the operators', () => {
    const total = YARD.workers.length + YARD.building.operators;
    expect(total).toBeGreaterThanOrEqual(6);
    expect(total).toBeLessThanOrEqual(8);
  });

  it('gives every walker a route with at least two points', () => {
    for (const worker of YARD.workers.filter((item) => item.role === 'walker')) {
      expect(worker.route?.length ?? 0, worker.id).toBeGreaterThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 3: Rodar o teste**

Run: `npx vitest run src/data/yard.test.ts`
Expected: 6 testes passando (o `yard.ts` já existe; o teste confirma que o layout é válido).

- [ ] **Step 4: Criar o `Conductor`**

`src/scene/conductors/Conductor.tsx`:

```tsx
import { useEffect, useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { sagPoints } from './curve';

export const DEFAULT_SAG = 0.6;

const MIN_LENGTH = 0.001;
const TUBE_RADIUS = 0.07;

interface ConductorProps {
  from: Vec3;
  to: Vec3;
  sag?: number;
}

export function Conductor({ from, to, sag = DEFAULT_SAG }: ConductorProps) {
  const geometry = useMemo(() => {
    if (Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]) < MIN_LENGTH) return null;
    const curve = new CatmullRomCurve3(sagPoints(from, to, sag).map(([x, y, z]) => new Vector3(x, y, z)));
    return new TubeGeometry(curve, 32, TUBE_RADIUS, 6, false);
  }, [from, to, sag]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;
  return <mesh geometry={geometry} material={MATERIALS.aluminum} castShadow />;
}
```

- [ ] **Step 5: Reescrever a `Scene`**

`src/scene/Scene.tsx`:

```tsx
import { useEffect } from 'react';
import type { Vec3 } from '../data/types';
import { validateYard } from '../data/validate';
import { YARD } from '../data/yard';
import { Conductor } from './conductors/Conductor';
import { terminalWorldPosition } from './conductors/curve';
import { Ground } from './environment/Ground';
import { Lighting } from './environment/Lighting';
import { resolveEquipmentComponent } from './equipment/registry';

interface ConductorSpec {
  key: string;
  from: Vec3;
  to: Vec3;
  sag?: number;
}

function buildConductors(): { conductors: ConductorSpec[]; errors: string[] } {
  const { validConnections, errors } = validateYard(YARD);
  const byId = new Map(YARD.equipment.map((item) => [item.id, item]));
  const conductors = validConnections.map(({ from, to, sag }) => ({
    key: `${from.equipmentId}.${from.terminal}>${to.equipmentId}.${to.terminal}`,
    from: terminalWorldPosition(byId.get(from.equipmentId)!, from.terminal),
    to: terminalWorldPosition(byId.get(to.equipmentId)!, to.terminal),
    sag,
  }));
  return { conductors, errors };
}

const { conductors: CONDUCTORS, errors: YARD_ERRORS } = buildConductors();

export function Scene() {
  useEffect(() => {
    for (const error of YARD_ERRORS) console.error(error);
  }, []);

  return (
    <>
      <Lighting />
      <Ground />
      {YARD.equipment.map((item) => {
        const Component = resolveEquipmentComponent(item.type);
        return <Component key={item.id} position={item.position} rotationY={item.rotationY} />;
      })}
      {CONDUCTORS.map(({ key, from, to, sag }) => (
        <Conductor key={key} from={from} to={to} sag={sag} />
      ))}
    </>
  );
}
```

- [ ] **Step 6: Verificar**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm test`
Expected: todos os testes passando.

Run: `npm run dev`
Expected: pórtico de entrada, seccionadora, TP, disjuntor, TC, dois transformadores com para-raios e o barramento ao sul; condutores ligando os terminais sem pontas soltas. Console sem erros de validação. Pare o servidor.

---

### Task 9: Cerca e árvores

**Files:**
- Create: `src/scene/environment/Fence.tsx`, `src/scene/environment/fencePosts.ts`, `src/scene/environment/Trees.tsx`
- Test: `src/scene/environment/fencePosts.test.ts`
- Modify: `src/scene/Scene.tsx`

**Interfaces:**
- Consumes: `YARD_SIZE` (Task 8), `MATERIALS`, `Block`, `Cylinder`.
- Produces: `fencePosts(width: number, depth: number, spacing: number): [number, number][]` (pares `[x, z]` sem repetir cantos), `Fence()`, `Trees()`.

- [ ] **Step 1: Escrever o teste que falha**

`src/scene/environment/fencePosts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { fencePosts } from './fencePosts';

describe('fencePosts', () => {
  it('places 66 distinct posts around a 60 x 40 fence every 3 m', () => {
    const posts = fencePosts(60, 40, 3);
    expect(posts).toHaveLength(66);
    expect(new Set(posts.map(([x, z]) => `${x.toFixed(3)},${z.toFixed(3)}`)).size).toBe(66);
  });

  it('includes the four corners', () => {
    const posts = fencePosts(60, 40, 3).map(([x, z]) => `${x.toFixed(3)},${z.toFixed(3)}`);
    for (const corner of ['-30.000,-20.000', '30.000,-20.000', '30.000,20.000', '-30.000,20.000']) {
      expect(posts).toContain(corner);
    }
  });

  it('keeps every post on the perimeter', () => {
    for (const [x, z] of fencePosts(60, 40, 3)) {
      const onVertical = Math.abs(Math.abs(x) - 30) < 1e-9;
      const onHorizontal = Math.abs(Math.abs(z) - 20) < 1e-9;
      expect(onVertical || onHorizontal).toBe(true);
    }
  });

  it('still returns posts when the spacing is larger than the fence', () => {
    expect(fencePosts(4, 4, 100).length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/scene/environment/fencePosts.test.ts`
Expected: FAIL com módulo `./fencePosts` não encontrado.

- [ ] **Step 3: Implementar `fencePosts` e os componentes**

`src/scene/environment/fencePosts.ts`:

```ts
export function fencePosts(width: number, depth: number, spacing: number): [number, number][] {
  const halfX = width / 2;
  const halfZ = depth / 2;
  const countX = Math.max(1, Math.round(width / spacing));
  const countZ = Math.max(1, Math.round(depth / spacing));
  const posts: [number, number][] = [];

  for (let i = 0; i < countX; i += 1) {
    const x = -halfX + (width * i) / countX;
    posts.push([x, -halfZ], [-x, halfZ]);
  }
  for (let i = 0; i < countZ; i += 1) {
    const z = -halfZ + (depth * i) / countZ;
    posts.push([halfX, z], [-halfX, -z]);
  }
  return posts;
}
```

`src/scene/environment/Fence.tsx`:

```tsx
import { Instance, Instances } from '@react-three/drei';
import { YARD_SIZE } from '../../data/yard';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { fencePosts } from './fencePosts';

const POSTS = fencePosts(YARD_SIZE.width, YARD_SIZE.depth, 3);
const POST_HEIGHT = 1.8;
const RAIL_HEIGHTS = [0.8, 1.6];

export function Fence() {
  const halfX = YARD_SIZE.width / 2;
  const halfZ = YARD_SIZE.depth / 2;
  return (
    <>
      <Instances limit={POSTS.length} material={MATERIALS.fence} castShadow>
        <boxGeometry args={[0.2, POST_HEIGHT, 0.2]} />
        {POSTS.map(([x, z]) => (
          <Instance key={`${x}:${z}`} position={[x, POST_HEIGHT / 2, z]} />
        ))}
      </Instances>
      {RAIL_HEIGHTS.flatMap((y) => [
        <Block key={`n${y}`} size={[YARD_SIZE.width, 0.08, 0.08]} position={[0, y, -halfZ]} material={MATERIALS.fence} />,
        <Block key={`s${y}`} size={[YARD_SIZE.width, 0.08, 0.08]} position={[0, y, halfZ]} material={MATERIALS.fence} />,
        <Block key={`w${y}`} size={[0.08, 0.08, YARD_SIZE.depth]} position={[-halfX, y, 0]} material={MATERIALS.fence} />,
        <Block key={`e${y}`} size={[0.08, 0.08, YARD_SIZE.depth]} position={[halfX, y, 0]} material={MATERIALS.fence} />,
      ])}
    </>
  );
}
```

`src/scene/environment/Trees.tsx`:

```tsx
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';

const TREE_POSITIONS: Vec3[] = [
  [-36, 0, -18],
  [-40, 0, -2],
  [-36, 0, 14],
  [-20, 0, 26],
  [0, 0, 28],
  [22, 0, 26],
  [36, 0, -22],
  [20, 0, -26],
  [-22, 0, -26],
  [42, 0, 16],
  [44, 0, -14],
  [-8, 0, -28],
];

export function Trees() {
  return (
    <>
      {TREE_POSITIONS.map((position, index) => {
        const scale = 0.9 + (index % 3) * 0.15;
        return (
          <group key={index} position={position} scale={scale}>
            <Cylinder radius={0.3} height={1.6} position={[0, 0.8, 0]} material={MATERIALS.trunk} segments={8} />
            <mesh position={[0, 2.8, 0]} material={MATERIALS.leaves} castShadow>
              <coneGeometry args={[1.6, 2.6, 8]} />
            </mesh>
            <mesh position={[0, 4.2, 0]} material={MATERIALS.leaves} castShadow>
              <coneGeometry args={[1.1, 2, 8]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
```

- [ ] **Step 4: Plugar na `Scene`**

Em `src/scene/Scene.tsx`, adicione os imports

```tsx
import { Fence } from './environment/Fence';
import { Trees } from './environment/Trees';
```

e, logo depois de `<Ground />`, adicione:

```tsx
      <Fence />
      <Trees />
```

- [ ] **Step 5: Verificar**

Run: `npx vitest run src/scene/environment/fencePosts.test.ts`
Expected: 4 testes passando.

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm run dev`
Expected: cerca com dois trilhos em volta do pátio de brita e árvores de cones espalhadas na grama, fora da cerca. Pare o servidor.

---

### Task 10: Prédio administrativo, sala de monitoramento e telhado

**Files:**
- Create: `src/scene/building/layout.ts`, `fade.ts`, `Roof.tsx`, `Desk.tsx`, `Monitor.tsx`, `Chair.tsx`, `MonitoringRoom.tsx`, `AdminBuilding.tsx` (todos em `src/scene/building/`)
- Test: `src/scene/building/fade.test.ts`, `src/scene/building/layout.test.ts`
- Modify: `src/scene/Scene.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: `Vec3`, `YARD` (Task 8), `MATERIALS`, `Block`, `Cylinder`.
- Produces:
  - `BUILDING = { width: 12, depth: 8, wallHeight: 3.6, wallThickness: 0.3, floorHeight: 0.2 }`, `OPERATOR_SEATS: readonly Vec3[]` (4 cadeiras), `operatorSeats(count: number): Vec3[]` em `layout.ts`.
  - `stepFade(current: number, target: number, delta: number, duration: number): number` em `fade.ts`.
  - `Roof({ openAmount: MutableRefObject<number> })`
  - `MonitoringRoom({ operators: number })` (a Task 11 adiciona as pessoas).
  - `AdminBuilding({ position: Vec3; rotationY?: number; operators: number; roofOpen: boolean; onToggleRoof: () => void })`
  - `Scene({ roofOpen: boolean; onToggleRoof: () => void })`.

- [ ] **Step 1: Escrever os testes que falham**

`src/scene/building/fade.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { stepFade } from './fade';

describe('stepFade', () => {
  it('moves toward a higher target by delta / duration', () => {
    expect(stepFade(0, 1, 0.1, 0.4)).toBeCloseTo(0.25);
  });

  it('moves toward a lower target', () => {
    expect(stepFade(1, 0, 0.2, 0.4)).toBeCloseTo(0.5);
  });

  it('does not change when already at the target', () => {
    expect(stepFade(1, 1, 0.5, 0.4)).toBe(1);
    expect(stepFade(0, 0, 0.5, 0.4)).toBe(0);
  });

  it('lands exactly on the target after a huge delta instead of overshooting', () => {
    expect(stepFade(0, 1, 1000, 0.4)).toBe(1);
    expect(stepFade(1, 0, 1000, 0.4)).toBe(0);
  });

  it('ignores a negative delta', () => {
    expect(stepFade(0.5, 1, -1, 0.4)).toBe(0.5);
  });

  it('jumps straight to the target when the duration is not positive', () => {
    expect(stepFade(0, 1, 0.01, 0)).toBe(1);
    expect(stepFade(1, 0, 0.01, -2)).toBe(0);
  });
});
```

`src/scene/building/layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { OPERATOR_SEATS, operatorSeats } from './layout';

describe('operatorSeats', () => {
  it('returns no seats for zero, negative or NaN counts', () => {
    expect(operatorSeats(0)).toEqual([]);
    expect(operatorSeats(-3)).toEqual([]);
    expect(operatorSeats(Number.NaN)).toEqual([]);
  });

  it('returns as many seats as requested', () => {
    expect(operatorSeats(2)).toHaveLength(2);
  });

  it('rounds a fractional count down', () => {
    expect(operatorSeats(1.9)).toHaveLength(1);
  });

  it('caps the count at the number of chairs in the room', () => {
    expect(operatorSeats(99)).toHaveLength(OPERATOR_SEATS.length);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/scene/building`
Expected: FAIL com módulos `./fade` e `./layout` não encontrados.

- [ ] **Step 3: Implementar `layout.ts` e `fade.ts`**

`src/scene/building/layout.ts`:

```ts
import type { Vec3 } from '../../data/types';

export const BUILDING = {
  width: 12,
  depth: 8,
  wallHeight: 3.6,
  wallThickness: 0.3,
  floorHeight: 0.2,
} as const;

export const OPERATOR_SEATS: readonly Vec3[] = [
  [-3, 0, -0.4],
  [-1.8, 0, -0.4],
  [1.8, 0, -0.4],
  [3, 0, -0.4],
];

export function operatorSeats(count: number): Vec3[] {
  return OPERATOR_SEATS.slice(0, Math.max(0, Math.floor(count)));
}
```

`src/scene/building/fade.ts`:

```ts
export function stepFade(current: number, target: number, delta: number, duration: number): number {
  if (duration <= 0) return target;
  const step = Math.max(delta, 0) / duration;
  if (current < target) return Math.min(current + step, target);
  return Math.max(current - step, target);
}
```

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `npx vitest run src/scene/building`
Expected: 10 testes passando.

- [ ] **Step 5: Criar as peças da sala**

`src/scene/building/Desk.tsx`:

```tsx
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

export function Desk({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block size={[3.4, 0.1, 1]} position={[0, 0.75, 0]} material={MATERIALS.deskTop} radius={0.03} />
      <Block size={[0.1, 0.7, 0.9]} position={[-1.55, 0.35, 0]} material={MATERIALS.chair} />
      <Block size={[0.1, 0.7, 0.9]} position={[1.55, 0.35, 0]} material={MATERIALS.chair} />
    </group>
  );
}
```

`src/scene/building/Monitor.tsx`:

```tsx
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

export function Monitor({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block size={[0.1, 0.25, 0.1]} position={[0, 0.125, 0]} material={MATERIALS.chair} />
      <Block size={[0.9, 0.55, 0.06]} position={[0, 0.5, 0]} material={MATERIALS.screenOn} />
    </group>
  );
}
```

`src/scene/building/Chair.tsx`:

```tsx
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';

export function Chair({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Cylinder radius={0.05} height={0.45} position={[0, 0.225, 0]} material={MATERIALS.steel} />
      <Block size={[0.55, 0.08, 0.55]} position={[0, 0.45, 0]} material={MATERIALS.chair} radius={0.03} />
      <Block size={[0.55, 0.6, 0.07]} position={[0, 0.8, 0.25]} material={MATERIALS.chair} radius={0.03} />
    </group>
  );
}
```

`src/scene/building/MonitoringRoom.tsx`:

```tsx
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Chair } from './Chair';
import { Desk } from './Desk';
import { BUILDING, OPERATOR_SEATS } from './layout';
import { Monitor } from './Monitor';

const DESK_Z = -1.4;
const DESK_XS = [-2.4, 2.4];
const MURAL_Z = -3.2;

interface MonitoringRoomProps {
  operators: number;
}

export function MonitoringRoom({ operators }: MonitoringRoomProps) {
  void operators;
  return (
    <group position={[0, BUILDING.floorHeight, 0]}>
      <Block size={[6, 1.8, 0.15]} position={[0, 1.9, MURAL_Z]} material={MATERIALS.panel} radius={0.05} />
      <Block size={[0.15, 1, 0.15]} position={[-2.6, 0.5, MURAL_Z]} material={MATERIALS.steel} />
      <Block size={[0.15, 1, 0.15]} position={[2.6, 0.5, MURAL_Z]} material={MATERIALS.steel} />
      {[2.5, 2.1, 1.7].map((y) => (
        <Block key={y} size={[4.6, 0.08, 0.02]} position={[0, y, MURAL_Z + 0.09]} material={MATERIALS.screenOn} />
      ))}
      <Block size={[0.08, 0.8, 0.02]} position={[0, 2.1, MURAL_Z + 0.09]} material={MATERIALS.screenOn} />
      {DESK_XS.map((x) => (
        <Desk key={x} position={[x, 0, DESK_Z]} />
      ))}
      {OPERATOR_SEATS.map(([x]) => (
        <group key={x}>
          <Monitor position={[x, 0.8, DESK_Z - 0.2]} />
          <Chair position={[x, 0, -0.4]} />
        </group>
      ))}
    </group>
  );
}
```

O `void operators;` é provisório: a Task 11 passa a usar o parâmetro para sentar as pessoas e remove essa linha.

`src/scene/building/Roof.tsx`:

```tsx
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import type { Mesh } from 'three';
import { MATERIALS } from '../materials';
import { BUILDING } from './layout';

interface RoofProps {
  openAmount: MutableRefObject<number>;
}

export function Roof({ openAmount }: RoofProps) {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(() => MATERIALS.roof.clone(), []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const amount = openAmount.current;
    const fading = amount > 0 && amount < 1;
    if (material.transparent !== fading) {
      material.transparent = fading;
      material.needsUpdate = true;
    }
    material.opacity = 1 - amount;
    if (mesh.current) mesh.current.visible = amount < 1;
  });

  return (
    <mesh ref={mesh} material={material} position={[0, BUILDING.floorHeight + BUILDING.wallHeight + 0.2, 0]} castShadow>
      <boxGeometry args={[BUILDING.width + 0.8, 0.4, BUILDING.depth + 0.8]} />
    </mesh>
  );
}
```

`src/scene/building/AdminBuilding.tsx`:

```tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { stepFade } from './fade';
import { BUILDING } from './layout';
import { MonitoringRoom } from './MonitoringRoom';
import { Roof } from './Roof';

const FADE_SECONDS = 0.4;
const LOWERED_WALL_SCALE = 0.3;
const CLICK_DRAG_TOLERANCE = 4;
const WINDOW_XS = [-4.4, -2.2, 2.2, 4.4];

interface AdminBuildingProps {
  position: Vec3;
  rotationY?: number;
  operators: number;
  roofOpen: boolean;
  onToggleRoof: () => void;
}

export function AdminBuilding({ position, rotationY = 0, operators, roofOpen, onToggleRoof }: AdminBuildingProps) {
  const openAmount = useRef(0);
  const walls = useRef<Group>(null);
  const { width, depth, wallHeight, wallThickness, floorHeight } = BUILDING;

  useFrame((_, delta) => {
    openAmount.current = stepFade(openAmount.current, roofOpen ? 1 : 0, delta, FADE_SECONDS);
    walls.current?.scale.setY(1 - (1 - LOWERED_WALL_SCALE) * openAmount.current);
  });

  return (
    <group
      position={position}
      rotation-y={rotationY}
      onClick={(event) => {
        if (event.delta > CLICK_DRAG_TOLERANCE) return;
        event.stopPropagation();
        onToggleRoof();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <Block size={[width, floorHeight, depth]} position={[0, floorHeight / 2, 0]} material={MATERIALS.floor} />
      <group ref={walls} position={[0, floorHeight, 0]}>
        <Block
          size={[width, wallHeight, wallThickness]}
          position={[0, wallHeight / 2, -depth / 2 + wallThickness / 2]}
          material={MATERIALS.wall}
        />
        <Block
          size={[width, wallHeight, wallThickness]}
          position={[0, wallHeight / 2, depth / 2 - wallThickness / 2]}
          material={MATERIALS.wall}
        />
        <Block
          size={[wallThickness, wallHeight, depth]}
          position={[-width / 2 + wallThickness / 2, wallHeight / 2, 0]}
          material={MATERIALS.wall}
        />
        <Block
          size={[wallThickness, wallHeight, depth]}
          position={[width / 2 - wallThickness / 2, wallHeight / 2, 0]}
          material={MATERIALS.wall}
        />
        {WINDOW_XS.map((x) => (
          <Block key={x} size={[1.6, 1.1, 0.1]} position={[x, 2, depth / 2 + 0.02]} material={MATERIALS.window} />
        ))}
        <Block size={[1.2, 2.2, 0.12]} position={[0, 1.1, depth / 2 + 0.03]} material={MATERIALS.accent} />
      </group>
      <MonitoringRoom operators={operators} />
      <Roof openAmount={openAmount} />
    </group>
  );
}
```

- [ ] **Step 6: Plugar na `Scene` e no `App`**

Em `src/scene/Scene.tsx`:

1. Adicione `import { AdminBuilding } from './building/AdminBuilding';`.
2. Troque a assinatura por `interface SceneProps { roofOpen: boolean; onToggleRoof: () => void }` e `export function Scene({ roofOpen, onToggleRoof }: SceneProps)`.
3. Depois de `<Trees />`, adicione:

```tsx
      <AdminBuilding
        position={YARD.building.position}
        rotationY={YARD.building.rotationY}
        operators={YARD.building.operators}
        roofOpen={roofOpen}
        onToggleRoof={onToggleRoof}
      />
```

Em `src/App.tsx` (ainda provisório):

```tsx
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { Scene } from './scene/Scene';

export function App() {
  const [roofOpen, setRoofOpen] = useState(false);
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [-44, 67, 47], fov: 35, near: 1, far: 400 }}>
      <Scene roofOpen={roofOpen} onToggleRoof={() => setRoofOpen((open) => !open)} />
      <OrbitControls />
    </Canvas>
  );
}
```

- [ ] **Step 7: Verificar**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm run dev`, vá até o prédio (leste do pátio, fora da cerca) e clique nele.
Expected: telhado vermelho que some em cerca de 0,4 s, paredes que abaixam e mostram painel mural, duas mesas, quatro monitores e quatro cadeiras; novo clique fecha o telhado; cursor vira `pointer` sobre o prédio; arrastar a câmera sobre o prédio não alterna o telhado. Pare o servidor.

---

### Task 11: Pessoas

**Files:**
- Create: `src/scene/people/poses.ts`, `src/scene/people/Worker.tsx`
- Test: `src/scene/people/poses.test.ts`
- Modify: `src/scene/Scene.tsx`, `src/scene/building/MonitoringRoom.tsx`

**Interfaces:**
- Consumes: `sampleRoute`, `headingBetween` (Task 4); `vestMaterial`, `MATERIALS` (Task 5); `operatorSeats` (Task 10); `WorkerRole`, `Vec3` (Task 2).
- Produces:
  - `Pose = 'walk' | 'inspect' | 'maintain' | 'sit'`, `PoseAngles`, `poseAt(pose: Pose, time: number, moving: boolean): PoseAngles` (ângulos em radianos; negativo balança para a frente).
  - `Worker({ kind: WorkerRole | 'operator'; position: Vec3; facing?: Vec3; heading?: number; route?: readonly Vec3[]; vestColor?: string; phase?: number; scale?: number })`.

- [ ] **Step 1: Escrever o teste que falha**

`src/scene/people/poses.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { poseAt, type Pose } from './poses';

const POSES: Pose[] = ['walk', 'inspect', 'maintain', 'sit'];

describe('poseAt', () => {
  it('swings opposite legs while walking', () => {
    const pose = poseAt('walk', 0.1, true);
    expect(Math.abs(pose.leftLeg)).toBeGreaterThan(0.1);
    expect(pose.leftLeg).toBeCloseTo(-pose.rightLeg);
  });

  it('keeps the legs still when a walker is paused', () => {
    const pose = poseAt('walk', 0.1, false);
    expect(pose.leftLeg).toBe(0);
    expect(pose.rightLeg).toBe(0);
  });

  it('repeats the walking cycle every 2*PI/7 seconds', () => {
    const period = (2 * Math.PI) / 7;
    expect(poseAt('walk', 0.3, true).leftLeg).toBeCloseTo(poseAt('walk', 0.3 + period, true).leftLeg, 8);
  });

  it('seats the operator with the legs forward and the hips lowered', () => {
    const pose = poseAt('sit', 0, false);
    expect(pose.leftLeg).toBeLessThan(-1.2);
    expect(pose.crouch).toBeGreaterThan(0.5);
  });

  it('crouches the maintainer', () => {
    expect(poseAt('maintain', 0, false).crouch).toBeGreaterThan(0.5);
  });

  it('keeps every angle finite for every pose, even at a huge elapsed time', () => {
    for (const pose of POSES) {
      for (const moving of [true, false]) {
        const angles = poseAt(pose, 1e6, moving);
        expect(Object.values(angles).every(Number.isFinite)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/scene/people/poses.test.ts`
Expected: FAIL com módulo `./poses` não encontrado.

- [ ] **Step 3: Implementar `poses.ts`**

`src/scene/people/poses.ts`:

```ts
export type Pose = 'walk' | 'inspect' | 'maintain' | 'sit';

export interface PoseAngles {
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  lean: number;
  crouch: number;
  headNod: number;
}

const STILL: PoseAngles = { leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, lean: 0, crouch: 0, headNod: 0 };
const STEP_RATE = 7;

export function poseAt(pose: Pose, time: number, moving: boolean): PoseAngles {
  switch (pose) {
    case 'walk': {
      if (!moving) {
        const sway = Math.sin(time * 1.5) * 0.05;
        return { ...STILL, leftArm: sway, rightArm: -sway };
      }
      const swing = Math.sin(time * STEP_RATE) * 0.7;
      return { ...STILL, leftLeg: swing, rightLeg: -swing, leftArm: -swing * 0.8, rightArm: swing * 0.8, lean: 0.05 };
    }
    case 'inspect':
      return { ...STILL, rightArm: -1.1 + Math.sin(time * 2) * 0.15, lean: 0.1, headNod: Math.sin(time * 0.8) * 0.1 };
    case 'maintain':
      return {
        ...STILL,
        leftArm: -0.4,
        rightArm: -0.6 + Math.sin(time * 5) * 0.5,
        leftLeg: -0.9,
        rightLeg: -0.9,
        lean: 0.4,
        crouch: 0.9,
      };
    case 'sit':
      return {
        ...STILL,
        leftArm: -1 + Math.sin(time * 9) * 0.08,
        rightArm: -1 + Math.sin(time * 9 + 1.3) * 0.08,
        leftLeg: -1.45,
        rightLeg: -1.45,
        lean: 0.05,
        crouch: 0.7,
        headNod: Math.sin(time * 0.7) * 0.08,
      };
  }
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/scene/people/poses.test.ts`
Expected: 6 testes passando.

- [ ] **Step 5: Criar o `Worker`**

`src/scene/people/Worker.tsx`:

```tsx
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BoxGeometry, SphereGeometry, type Group } from 'three';
import type { Vec3, WorkerRole } from '../../data/types';
import { MATERIALS, vestMaterial } from '../materials';
import { poseAt, type Pose } from './poses';
import { headingBetween, sampleRoute } from './routes';

export type WorkerKind = WorkerRole | 'operator';

const POSE_BY_KIND: Record<WorkerKind, Pose> = {
  walker: 'walk',
  inspector: 'inspect',
  maintainer: 'maintain',
  operator: 'sit',
};

const HIP_HEIGHT = 0.9;
const CROUCH_DROP = 0.5;
const WALK_SPEED = 1.2;
const WALK_PAUSE = 2.5;

const GEOMETRY = {
  torso: new BoxGeometry(0.42, 0.55, 0.26),
  head: new SphereGeometry(0.15, 12, 10),
  helmet: new SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  arm: new BoxGeometry(0.12, 0.5, 0.12),
  leg: new BoxGeometry(0.15, 0.9, 0.15),
};

interface WorkerProps {
  kind: WorkerKind;
  position: Vec3;
  facing?: Vec3;
  heading?: number;
  route?: readonly Vec3[];
  vestColor?: string;
  phase?: number;
  scale?: number;
}

export function Worker({
  kind,
  position,
  facing,
  heading,
  route,
  vestColor = '#ff7a1a',
  phase = 0,
  scale = 1.4,
}: WorkerProps) {
  const root = useRef<Group>(null);
  const hip = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);

  const vest = useMemo(() => vestMaterial(vestColor), [vestColor]);
  const initialHeading = heading ?? (facing ? headingBetween(position, facing) : 0);
  const pose = POSE_BY_KIND[kind];

  useFrame((state) => {
    const time = state.clock.elapsedTime + phase;
    let moving = false;

    if (route && root.current) {
      const sample = sampleRoute(route, { speed: WALK_SPEED, pause: WALK_PAUSE }, time);
      root.current.position.set(sample.position[0], sample.position[1], sample.position[2]);
      root.current.rotation.y = sample.heading;
      moving = sample.moving;
    }

    const parts = [hip, torso, head, leftArm, rightArm, leftLeg, rightLeg].map((part) => part.current);
    const [h, t, hd, la, ra, ll, rl] = parts;
    if (!h || !t || !hd || !la || !ra || !ll || !rl) return;

    const angles = poseAt(pose, time, moving);
    h.position.y = HIP_HEIGHT - angles.crouch * CROUCH_DROP;
    t.rotation.x = angles.lean;
    hd.rotation.x = angles.headNod;
    la.rotation.x = angles.leftArm;
    ra.rotation.x = angles.rightArm;
    ll.rotation.x = angles.leftLeg;
    rl.rotation.x = angles.rightLeg;
  });

  return (
    <group ref={root} position={position} rotation-y={initialHeading} scale={scale}>
      <group ref={hip} position-y={HIP_HEIGHT}>
        <group ref={leftLeg} position={[-0.1, 0, 0]}>
          <mesh geometry={GEOMETRY.leg} material={MATERIALS.pants} position-y={-0.45} castShadow />
        </group>
        <group ref={rightLeg} position={[0.1, 0, 0]}>
          <mesh geometry={GEOMETRY.leg} material={MATERIALS.pants} position-y={-0.45} castShadow />
        </group>
        <group ref={torso}>
          <mesh geometry={GEOMETRY.torso} material={vest} position-y={0.3} castShadow />
          <group ref={leftArm} position={[-0.29, 0.52, 0]}>
            <mesh geometry={GEOMETRY.arm} material={vest} position-y={-0.25} castShadow />
          </group>
          <group ref={rightArm} position={[0.29, 0.52, 0]}>
            <mesh geometry={GEOMETRY.arm} material={vest} position-y={-0.25} castShadow />
          </group>
          <group ref={head} position={[0, 0.62, 0]}>
            <mesh geometry={GEOMETRY.head} material={MATERIALS.skin} position-y={0.12} castShadow />
            <mesh geometry={GEOMETRY.helmet} material={MATERIALS.helmet} position-y={0.14} castShadow />
          </group>
        </group>
      </group>
    </group>
  );
}
```

- [ ] **Step 6: Plugar as pessoas do pátio e os operadores**

Em `src/scene/Scene.tsx`, adicione `import { Worker } from './people/Worker';` e, depois do `<AdminBuilding ... />`, adicione:

```tsx
      {YARD.workers.map((worker, index) => (
        <Worker
          key={worker.id}
          kind={worker.role}
          position={worker.position}
          facing={worker.facing}
          route={worker.route}
          vestColor={worker.vestColor}
          phase={index * 1.7}
        />
      ))}
```

Em `src/scene/building/MonitoringRoom.tsx`:

1. Remova a linha `void operators;`.
2. Adicione `import { Worker } from '../people/Worker';` e troque o import de layout para `import { BUILDING, OPERATOR_SEATS, operatorSeats } from './layout';`.
3. Antes do `</group>` final, adicione:

```tsx
      {operatorSeats(operators).map((seat, index) => (
        <Worker
          key={`operator-${index}`}
          kind="operator"
          position={seat}
          heading={Math.PI}
          vestColor="#3b82f6"
          phase={index * 2.3}
          scale={1}
        />
      ))}
```

Os operadores usam `scale={1}` para casar com o tamanho do mobiliário.

- [ ] **Step 7: Verificar**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm test`
Expected: todos os testes passando.

Run: `npm run dev`
Expected: dois caminhantes andando e parando nos extremos das rotas (sem atravessar equipamentos), dois inspetores de braço levantado ao lado dos transformadores, um mantenedor agachado perto do para-raios da esquerda e, com o telhado aberto, três operadores sentados de frente para os monitores. Pare o servidor.

---

### Task 12: Câmera, tour e `App` final

**Files:**
- Create: `src/data/cameraLimits.ts`, `src/data/viewpoints.ts`, `src/scene/camera/CameraRig.tsx`, `src/ui/TourControls.tsx`, `src/ui/ErrorBoundary.tsx`, `src/ui/webgl.ts`
- Test: `src/data/viewpoints.test.ts`
- Modify: `src/App.tsx` (reescrita completa), `src/index.css`

**Interfaces:**
- Consumes: `Viewpoint`, `Vec3` (Task 2); `Scene` (Task 10).
- Produces:
  - `CAMERA_LIMITS = { fov, minPolar, maxPolar, minDistance, maxDistance, bounds: { min: Vec3; max: Vec3 } }` (ângulos em radianos).
  - `VIEWPOINTS: Viewpoint[]` (`overview`, `line-entry`, `transformers`, `monitoring-room`).
  - `CameraRig({ request: TourRequest })`, `TourRequest = { viewpoint: Viewpoint; nonce: number }`.
  - `TourControls({ viewpoints, activeId, onSelect })`, `ErrorBoundary({ fallback, children })`, `supportsWebGL2(): boolean`.

- [ ] **Step 1: Criar limites e pontos de vista**

`src/data/cameraLimits.ts`:

```ts
import type { Vec3 } from './types';

const degrees = (value: number) => (value * Math.PI) / 180;

interface CameraLimits {
  fov: number;
  minPolar: number;
  maxPolar: number;
  minDistance: number;
  maxDistance: number;
  bounds: { min: Vec3; max: Vec3 };
}

export const CAMERA_LIMITS: CameraLimits = {
  fov: 35,
  minPolar: degrees(25),
  maxPolar: degrees(60),
  minDistance: 10,
  maxDistance: 130,
  bounds: { min: [-45, 0, -28], max: [45, 0, 28] },
};
```

`src/data/viewpoints.ts`:

```ts
import type { Viewpoint } from './types';

export const VIEWPOINTS: Viewpoint[] = [
  { id: 'overview', label: 'Visão geral', position: [-44, 67, 47], target: [3, 0, 0] },
  { id: 'line-entry', label: 'Entrada de linha', position: [-12, 20, -2], target: [0, 3, -14] },
  { id: 'transformers', label: 'Transformadores', position: [-18, 32, 21], target: [0, 2, 3] },
  { id: 'monitoring-room', label: 'Sala de monitoramento', position: [24, 20, 14], target: [38, 0, 0], openRoof: true },
];
```

- [ ] **Step 2: Escrever o teste dos pontos de vista**

`src/data/viewpoints.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CAMERA_LIMITS } from './cameraLimits';
import { VIEWPOINTS } from './viewpoints';

const offset = (viewpoint: (typeof VIEWPOINTS)[number]) =>
  viewpoint.position.map((value, axis) => value - viewpoint.target[axis]);

describe('VIEWPOINTS', () => {
  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s respects the polar angle and distance limits',
    (_id, viewpoint) => {
      const [dx, dy, dz] = offset(viewpoint);
      const distance = Math.hypot(dx, dy, dz);
      const polar = Math.acos(dy / distance);
      expect(polar).toBeGreaterThanOrEqual(CAMERA_LIMITS.minPolar);
      expect(polar).toBeLessThanOrEqual(CAMERA_LIMITS.maxPolar);
      expect(distance).toBeGreaterThanOrEqual(CAMERA_LIMITS.minDistance);
      expect(distance).toBeLessThanOrEqual(CAMERA_LIMITS.maxDistance);
    },
  );

  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s targets a point inside the pan bounds',
    (_id, viewpoint) => {
      const { min, max } = CAMERA_LIMITS.bounds;
      expect(viewpoint.target[0]).toBeGreaterThanOrEqual(min[0]);
      expect(viewpoint.target[0]).toBeLessThanOrEqual(max[0]);
      expect(viewpoint.target[2]).toBeGreaterThanOrEqual(min[2]);
      expect(viewpoint.target[2]).toBeLessThanOrEqual(max[2]);
      expect(viewpoint.target[1]).toBeGreaterThanOrEqual(0);
    },
  );

  it('has unique ids and non-empty labels', () => {
    expect(new Set(VIEWPOINTS.map((viewpoint) => viewpoint.id)).size).toBe(VIEWPOINTS.length);
    expect(VIEWPOINTS.every((viewpoint) => viewpoint.label.trim().length > 0)).toBe(true);
  });

  it('opens the roof only for the monitoring room', () => {
    const withRoof = VIEWPOINTS.filter((viewpoint) => viewpoint.openRoof).map((viewpoint) => viewpoint.id);
    expect(withRoof).toEqual(['monitoring-room']);
  });
});
```

- [ ] **Step 3: Rodar o teste**

Run: `npx vitest run src/data/viewpoints.test.ts`
Expected: todos os testes passando. Se algum ponto de vista violar um limite, ajuste a posição dele em `viewpoints.ts` (o teste existe para pegar isso).

- [ ] **Step 4: Criar a câmera, o tour e os utilitários de UI**

`src/scene/camera/CameraRig.tsx`:

```tsx
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import { CAMERA_LIMITS } from '../../data/cameraLimits';
import type { Viewpoint } from '../../data/types';

export interface TourRequest {
  viewpoint: Viewpoint;
  nonce: number;
}

const { ACTION } = CameraControlsImpl;

export function CameraRig({ request }: { request: TourRequest }) {
  const controls = useRef<CameraControlsImpl>(null);

  useEffect(() => {
    const [minX, minY, minZ] = CAMERA_LIMITS.bounds.min;
    const [maxX, maxY, maxZ] = CAMERA_LIMITS.bounds.max;
    controls.current?.setBoundary(new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ)));
  }, []);

  useEffect(() => {
    const { position, target } = request.viewpoint;
    controls.current?.setLookAt(...position, ...target, request.nonce > 0);
  }, [request]);

  return (
    <CameraControls
      ref={controls}
      minPolarAngle={CAMERA_LIMITS.minPolar}
      maxPolarAngle={CAMERA_LIMITS.maxPolar}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      smoothTime={0.25}
      touches={{ one: ACTION.TOUCH_TRUCK, two: ACTION.TOUCH_DOLLY_ROTATE, three: ACTION.TOUCH_TRUCK }}
    />
  );
}
```

Se `CameraControlsImpl` não for exportado pela versão instalada do drei, confira `node_modules/@react-three/drei/core/CameraControls.d.ts` e importe o `ACTION` e o tipo pelo caminho que ela expõe.

`src/ui/TourControls.tsx`:

```tsx
import type { Viewpoint } from '../data/types';

interface TourControlsProps {
  viewpoints: readonly Viewpoint[];
  activeId: string | null;
  onSelect: (viewpoint: Viewpoint) => void;
}

export function TourControls({ viewpoints, activeId, onSelect }: TourControlsProps) {
  return (
    <nav className="tour" aria-label="Pontos de vista">
      <div className="tour-buttons">
        {viewpoints.map((viewpoint) => (
          <button
            key={viewpoint.id}
            type="button"
            className={viewpoint.id === activeId ? 'active' : undefined}
            onClick={() => onSelect(viewpoint)}
          >
            {viewpoint.label}
          </button>
        ))}
      </div>
      <p className="tour-hint">Toque no prédio para abrir o telhado</p>
    </nav>
  );
}
```

`src/ui/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Scene failed to render', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
```

`src/ui/webgl.ts`:

```ts
export function supportsWebGL2(): boolean {
  try {
    return document.createElement('canvas').getContext('webgl2') !== null;
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Reescrever o `App` e o CSS**

`src/App.tsx`:

```tsx
import { Canvas } from '@react-three/fiber';
import { useCallback, useState } from 'react';
import { CAMERA_LIMITS } from './data/cameraLimits';
import type { Viewpoint } from './data/types';
import { VIEWPOINTS } from './data/viewpoints';
import { CameraRig, type TourRequest } from './scene/camera/CameraRig';
import { Scene } from './scene/Scene';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { TourControls } from './ui/TourControls';
import { supportsWebGL2 } from './ui/webgl';

const WEBGL_MESSAGE = 'Não foi possível iniciar a cena 3D. Verifique se o seu navegador suporta WebGL2.';
const INITIAL_REQUEST: TourRequest = { viewpoint: VIEWPOINTS[0], nonce: 0 };

export function App() {
  const [roofOpen, setRoofOpen] = useState(false);
  const [request, setRequest] = useState(INITIAL_REQUEST);
  const [activeId, setActiveId] = useState<string | null>(VIEWPOINTS[0].id);

  const goTo = useCallback((viewpoint: Viewpoint) => {
    setRequest((current) => ({ viewpoint, nonce: current.nonce + 1 }));
    setActiveId(viewpoint.id);
    if (viewpoint.openRoof) setRoofOpen(true);
  }, []);

  const toggleRoof = useCallback(() => setRoofOpen((open) => !open), []);

  if (!supportsWebGL2()) return <p className="fallback">{WEBGL_MESSAGE}</p>;

  return (
    <ErrorBoundary fallback={<p className="fallback">{WEBGL_MESSAGE}</p>}>
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="always"
        camera={{ fov: CAMERA_LIMITS.fov, near: 1, far: 400, position: VIEWPOINTS[0].position }}
      >
        <Scene roofOpen={roofOpen} onToggleRoof={toggleRoof} />
        <CameraRig request={request} />
      </Canvas>
      <TourControls viewpoints={VIEWPOINTS} activeId={activeId} onSelect={goTo} />
    </ErrorBoundary>
  );
}
```

`src/index.css` (substitui o conteúdo):

```css
html,
body,
#root {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: #bfe3ff;
  font-family: system-ui, sans-serif;
}

canvas {
  touch-action: none;
}

.tour {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.tour-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.tour button {
  pointer-events: auto;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font: inherit;
  font-weight: 600;
  color: #243447;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.tour button.active {
  color: #fff;
  background: #2a9bb8;
}

.tour-hint {
  margin: 0;
  font-size: 13px;
  color: #243447;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.fallback {
  display: grid;
  place-items: center;
  height: 100%;
  margin: 0;
  padding: 16px;
  text-align: center;
  color: #243447;
}
```

- [ ] **Step 6: Verificar**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm test`
Expected: todos os testes passando.

Run: `npm run dev`
Expected:
- A vista inicial mostra o pátio inteiro em 3/4.
- Arrastar com o botão esquerdo gira em volta sem passar do limite de inclinação, e a câmera nunca desce ao nível do chão.
- O botão direito move (pan) e para nas bordas da área; a roda aproxima e afasta com limite.
- Cada botão do tour leva a câmera ao ponto com transição suave; "Sala de monitoramento" abre o telhado.
- No emulador de celular do navegador: um dedo move, dois dedos fazem pinça e giro.

Pare o servidor.

---

### Task 13: Contorno, desempenho e verificação final

**Files:**
- Create: `src/scene/flags.ts`
- Modify: `src/scene/primitives.tsx`, `src/scene/equipment/PowerTransformer.tsx`, `src/scene/equipment/Gantry.tsx`, `src/scene/building/AdminBuilding.tsx`, `src/App.tsx`, `docs/roadmap.md`

**Interfaces:**
- Consumes: `Block` (Task 5).
- Produces: `OUTLINES_ENABLED: boolean`, `OUTLINE_COLOR: string`; `Block` aceita `outline?: boolean`.

- [ ] **Step 1: Criar a flag e o contorno no `Block`**

`src/scene/flags.ts`:

```ts
export const OUTLINES_ENABLED = true;
export const OUTLINE_COLOR = '#1d2b3a';
```

Em `src/scene/primitives.tsx`:

1. Adicione os imports `import { Outlines } from '@react-three/drei';` e `import { OUTLINE_COLOR, OUTLINES_ENABLED } from './flags';`.
2. Adicione `outline?: boolean;` em `BlockProps`.
3. Troque o `Block` por:

```tsx
export function Block({ size, position, material, radius = 0, rotation, outline = false }: BlockProps) {
  return (
    <mesh
      geometry={boxGeometry(size, radius)}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      {outline && OUTLINES_ENABLED && <Outlines thickness={0.04} color={OUTLINE_COLOR} />}
    </mesh>
  );
}
```

- [ ] **Step 2: Aplicar o contorno só nas peças grandes e únicas**

Adicione a prop `outline` a estes `Block` (e a nenhum isolador, cerca ou árvore):

- `PowerTransformer.tsx`: o `Block` do tanque (o de `radius={0.25}`).
- `Gantry.tsx`: os três `Block` (duas colunas e a viga).
- `AdminBuilding.tsx`: os quatro `Block` das paredes.

- [ ] **Step 3: Adicionar o medidor de fps por flag de URL**

Em `src/App.tsx`, importe `Stats` (`import { Stats } from '@react-three/drei';`) e adicione, dentro do `Canvas`, logo depois de `<CameraRig request={request} />`:

```tsx
        {new URLSearchParams(window.location.search).has('stats') && <Stats />}
```

- [ ] **Step 4: Rodar testes e tipos**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm test`
Expected: todos os testes passando.

Contingência: se algum teste passou a falhar por causa de `window` ou `document` não definidos ao importar o drei (por exemplo, `registry.test.ts`), instale `npm install -D jsdom` e troque `environment: 'node'` por `environment: 'jsdom'` em `vite.config.ts`. Rode `npm test` de novo.

- [ ] **Step 5: Medir o desempenho**

Run: `npm run dev` e abra `http://localhost:5173/?stats`.

- No desktop: confirme pelo medidor que o fps fica em 55 ou mais na vista geral e no tour.
- Simule celular: no DevTools, ative o emulador de dispositivo e a limitação de CPU em 4x; confirme 50 fps ou mais na vista geral.
- Se ficar abaixo, aplique as medidas nesta ordem, medindo a cada uma: (1) `OUTLINES_ENABLED = false` em `flags.ts`; (2) reduzir `shadow-mapSize` para `[1024, 1024]` em `Lighting.tsx`; (3) trocar os `Insulator` por `Instances` do drei.

Se uma medida for adotada, registre qual na seção "Status" do final deste plano.

- [ ] **Step 6: Checklist final dos critérios de sucesso da spec**

Marque cada item olhando a cena rodando:

- [ ] A subestação é reconhecível de relance (transformadores, pórtico, seccionadora, disjuntor, barramento, condutores).
- [ ] Há pessoas se movendo e trabalhando no pátio; operadores sentados na sala de monitoramento com o telhado aberto.
- [ ] Visual coerente: paleta saturada, formas arredondadas, sombras suaves, sem texturas.
- [ ] A câmera fica sempre acima do pátio e nunca desce ao nível do chão.
- [ ] Navegação fluida com mouse e com toque.
- [ ] O tour leva aos quatro pontos de vista, e a sala de monitoramento abre o telhado.
- [ ] 60 fps no notebook e fluidez aceitável no celular emulado.
- [ ] O console não mostra erros de validação do `yard.ts`.

- [ ] **Step 7: Atualizar a documentação**

Em `docs/roadmap.md`, troque o status da Parte 1 para "Implementada, aguardando revisão" e, em `docs/superpowers/specs/2026-10-07-parte-1-patio-3d-design.md`, troque a linha `Status` para "Implementada, aguardando revisão".

Liste para o usuário todos os arquivos criados e alterados, para ele fazer o commit.

---

## Status

Plano escrito, ainda não executado.
