# Parte 1, Revisão 2: Referências Visuais, Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar a cena da Parte 1 para o visual das imagens de referência: câmera isométrica, base em diorama, paleta cinza-azulada com cerca amarela, e equipamentos com as formas das referências (transformador de três buchas, equipamentos trifásicos, pórtico de treliça, armários).

**Architecture:** Mudanças sobre o código existente, sem mexer no modelo de dados dos condutores. A câmera passa a ser ortográfica, com zoom definido por uma largura visível (`span`) em vez de distância. O diorama e a cerca são componentes de ambiente reescritos. Os equipamentos continuam ligados aos mesmos terminais, e os trifásicos só repetem as colunas ao redor da fase central.

**Tech Stack:** o mesmo da revisão 1 (Vite, React 19, R3F 9, drei 10, three, Vitest).

**Spec:** [2026-10-07-parte-1-patio-3d-design.md](../specs/2026-10-07-parte-1-patio-3d-design.md) (revisão 2). Imagens de referência em `public/istockphoto-*-612x612.jpg`.

## Global Constraints

- **Git:** nenhum comando git deve ser executado pelo agente (regra do usuário). O usuário faz os commits.
- **Comentários:** no máximo 2 linhas, só para o que o código não deixa claro. Nada de comentário que explique o que o código faz, nada de bloco explicativo acima de função/constante/classe.
- **Escala:** 1 unidade = 1 m nominal; Y para cima; chão em `y = 0`; pátio centrado na origem; pátio de cerca de 60 m × 40 m; placa do diorama de 96 m × 60 m.
- **Idioma:** identificadores e comentários de código em inglês; textos da interface em português do Brasil.
- **Câmera:** ortográfica; inclinação fixa de `Math.acos(1 / Math.sqrt(3))` rad a partir da vertical; rotação horizontal livre; zoom por largura visível (`span`) entre 24 e 130; pan limitado a `[-48, 0, -30]` até `[48, 0, 30]`.
- **Estilo:** `MeshStandardMaterial` com `flatShading`; sem texturas, sem HDRI, sem pós-processamento, sem névoa; fundo `#f3f6fa`.
- **Desempenho:** 60 fps no notebook e fluidez no celular; contorno só no tanque do transformador e nas paredes do prédio; painéis translúcidos da cerca não projetam sombra.
- **Terminais:** continuam definidos só em `src/data/terminals.ts`, na fase central; os condutores não mudam de quantidade.
- **Componentes visuais:** componentes 3D sem lógica própria não têm teste automatizado; eles são verificados pelos testes de folga dos condutores e por capturas de tela (Task 6).

## Review Focus

1. **Tela estreita (celular em retrato):** o zoom por `span` nunca pode passar dos limites, e um `span` fora da faixa é limitado em vez de gerar zoom absurdo (Task 1).
2. **Alvo de ponto de vista fora da área de pan:** o teste falha, em vez de a câmera deslizar na primeira arrastada (Task 1).
3. **Árvore sobre a cerca, sobre o prédio ou fora da placa:** o teste falha (Task 2).
4. **Condutor atravessando as novas buchas ou o conservador:** o teste de folga existente continua verde (Task 3).
5. **Conexão para um equipamento sem terminais (armário):** é rejeitada com erro claro, sem derrubar a cena (Task 5).

---

## Mapa de arquivos

```
src/data/        types.ts (Viewpoint.span, 'cabinet')   cameraLimits.ts   viewpoints.ts   trees.ts   terminals.ts   yard.ts
src/scene/       materials.ts   App.tsx (src/)   camera/CameraRig.tsx
  environment/   Ground.tsx   Fence.tsx   Lighting.tsx   Trees.tsx
  conductors/    Conductor.tsx
  equipment/     PowerTransformer.tsx   phases.ts   CircuitBreaker.tsx   Disconnector.tsx   CurrentTransformer.tsx
                 PotentialTransformer.tsx   SurgeArrester.tsx   Lattice.tsx   Gantry.tsx   ControlCabinet.tsx   registry.tsx
```

---

### Task 1: Câmera isométrica

**Files:**
- Modify: `src/data/types.ts`, `src/data/cameraLimits.ts` (reescrita), `src/data/viewpoints.ts` (reescrita), `src/scene/camera/CameraRig.tsx` (reescrita), `src/App.tsx`
- Test: `src/data/cameraLimits.test.ts` (novo), `src/data/viewpoints.test.ts` (reescrita)

**Interfaces:**
- Consumes: `Viewpoint`, `Vec3` (`src/data/types.ts`).
- Produces:
  - `Viewpoint` ganha `span: number`.
  - `ISO_POLAR: number`; `CAMERA_LIMITS = { polar, minSpan, maxSpan, bounds: { min: Vec3; max: Vec3 } }`; `zoomForSpan(span: number, viewportWidth: number): number` (limita `span` entre `minSpan` e `maxSpan`).
  - `VIEWPOINTS: Viewpoint[]` com os mesmos ids de antes (`overview`, `line-entry`, `transformers`, `monitoring-room`), todos na inclinação isométrica.
  - `CameraRig({ request: TourRequest })` e `TourRequest` com a mesma forma de antes.

- [ ] **Step 1: Escrever os testes que falham**

`src/data/cameraLimits.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CAMERA_LIMITS, ISO_POLAR, zoomForSpan } from './cameraLimits';

describe('ISO_POLAR', () => {
  it('is the isometric angle, about 54.74 degrees from the vertical', () => {
    expect((ISO_POLAR * 180) / Math.PI).toBeCloseTo(54.7356, 3);
  });
});

describe('zoomForSpan', () => {
  it('divides the viewport width by the span', () => {
    expect(zoomForSpan(60, 1200)).toBeCloseTo(20);
  });

  it('keeps a narrow phone in portrait at a proportionally smaller zoom', () => {
    expect(zoomForSpan(60, 390)).toBeCloseTo(6.5);
  });

  it('limits a tiny span to the minimum span', () => {
    expect(zoomForSpan(1, 1200)).toBeCloseTo(1200 / CAMERA_LIMITS.minSpan);
  });

  it('limits a huge span to the maximum span', () => {
    expect(zoomForSpan(1000, 1300)).toBeCloseTo(1300 / CAMERA_LIMITS.maxSpan);
  });
});
```

`src/data/viewpoints.test.ts` (substitui o conteúdo):

```ts
import { describe, expect, it } from 'vitest';
import { CAMERA_LIMITS, ISO_POLAR } from './cameraLimits';
import { VIEWPOINTS } from './viewpoints';

const polarOf = (viewpoint: (typeof VIEWPOINTS)[number]) => {
  const [dx, dy, dz] = viewpoint.position.map((value, axis) => value - viewpoint.target[axis]);
  return Math.acos(dy / Math.hypot(dx, dy, dz));
};

describe('VIEWPOINTS', () => {
  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s uses the isometric tilt and a span inside the limits',
    (_id, viewpoint) => {
      expect(polarOf(viewpoint)).toBeCloseTo(ISO_POLAR, 3);
      expect(viewpoint.span).toBeGreaterThanOrEqual(CAMERA_LIMITS.minSpan);
      expect(viewpoint.span).toBeLessThanOrEqual(CAMERA_LIMITS.maxSpan);
    },
  );

  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s targets a point inside the pan bounds, including its height',
    (_id, viewpoint) => {
      const { min, max } = CAMERA_LIMITS.bounds;
      for (const axis of [0, 1, 2]) {
        expect(viewpoint.target[axis]).toBeGreaterThanOrEqual(min[axis]);
        expect(viewpoint.target[axis]).toBeLessThanOrEqual(max[axis]);
      }
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

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/data/cameraLimits.test.ts src/data/viewpoints.test.ts`
Expected: FAIL. `cameraLimits.test.ts` falha porque `ISO_POLAR` e `zoomForSpan` não existem; `viewpoints.test.ts` falha porque `CAMERA_LIMITS.minSpan` e `viewpoint.span` não existem.

- [ ] **Step 3: Implementar**

Em `src/data/types.ts`, troque a interface `Viewpoint` por:

```ts
export interface Viewpoint {
  id: string;
  label: string;
  position: Vec3;
  target: Vec3;
  span: number;
  openRoof?: boolean;
}
```

`src/data/cameraLimits.ts` (substitui o conteúdo):

```ts
import type { Vec3 } from './types';

interface CameraLimits {
  polar: number;
  minSpan: number;
  maxSpan: number;
  bounds: { min: Vec3; max: Vec3 };
}

export const ISO_POLAR = Math.acos(1 / Math.sqrt(3));

export const CAMERA_LIMITS: CameraLimits = {
  polar: ISO_POLAR,
  minSpan: 24,
  maxSpan: 130,
  bounds: { min: [-48, 0, -30], max: [48, 0, 30] },
};

export function zoomForSpan(span: number, viewportWidth: number): number {
  const clamped = Math.min(Math.max(span, CAMERA_LIMITS.minSpan), CAMERA_LIMITS.maxSpan);
  return viewportWidth / clamped;
}
```

`src/data/viewpoints.ts` (substitui o conteúdo):

```ts
import type { Vec3, Viewpoint } from './types';

const ISO_OFFSET: Vec3 = [-57.735, 57.735, 57.735];

function isoViewpoint(id: string, label: string, target: Vec3, span: number, openRoof?: boolean): Viewpoint {
  const position: Vec3 = [target[0] + ISO_OFFSET[0], target[1] + ISO_OFFSET[1], target[2] + ISO_OFFSET[2]];
  return { id, label, position, target, span, openRoof };
}

export const VIEWPOINTS: Viewpoint[] = [
  isoViewpoint('overview', 'Visão geral', [3, 0, 0], 118),
  isoViewpoint('line-entry', 'Entrada de linha', [0, 0, -14], 36),
  isoViewpoint('transformers', 'Transformadores', [0, 0, 3], 50),
  isoViewpoint('monitoring-room', 'Sala de monitoramento', [38, 0, 0], 34, true),
];
```

`src/scene/camera/CameraRig.tsx` (substitui o conteúdo):

```tsx
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import { CAMERA_LIMITS, zoomForSpan } from '../../data/cameraLimits';
import type { Viewpoint } from '../../data/types';

export interface TourRequest {
  viewpoint: Viewpoint;
  nonce: number;
}

const { ACTION } = CameraControlsImpl;

export function CameraRig({ request }: { request: TourRequest }) {
  const controls = useRef<CameraControlsImpl>(null);
  const width = useThree((state) => state.size.width);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    const [minX, minY, minZ] = CAMERA_LIMITS.bounds.min;
    const [maxX, maxY, maxZ] = CAMERA_LIMITS.bounds.max;
    controls.current?.setBoundary(new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ)));
  }, []);

  useEffect(() => {
    const { position, target, span } = request.viewpoint;
    const animate = request.nonce > 0;
    controls.current?.setLookAt(...position, ...target, animate);
    controls.current?.zoomTo(zoomForSpan(span, widthRef.current), animate);
  }, [request]);

  return (
    <CameraControls
      ref={controls}
      minPolarAngle={CAMERA_LIMITS.polar}
      maxPolarAngle={CAMERA_LIMITS.polar}
      minZoom={width / CAMERA_LIMITS.maxSpan}
      maxZoom={width / CAMERA_LIMITS.minSpan}
      smoothTime={0.25}
      touches={{ one: ACTION.TOUCH_TRUCK, two: ACTION.TOUCH_DOLLY_ROTATE, three: ACTION.TOUCH_TRUCK }}
    />
  );
}
```

Em `src/App.tsx`:
1. Troque o import `import { CAMERA_LIMITS } from './data/cameraLimits';` por `import { zoomForSpan } from './data/cameraLimits';`.
2. Troque o `<Canvas ...>` de abertura por:

```tsx
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        frameloop="always"
        orthographic
        camera={{
          near: 0.1,
          far: 500,
          position: VIEWPOINTS[0].position,
          zoom: zoomForSpan(VIEWPOINTS[0].span, window.innerWidth),
        }}
      >
```

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `npx vitest run src/data/cameraLimits.test.ts src/data/viewpoints.test.ts`
Expected: todos passando.

Run: `npm run typecheck`
Expected: sem erros. Se `minZoom`/`maxZoom` não forem aceitos como props do `CameraControls`, aplique-os pela ref dentro do `useEffect` (`controls.current.minZoom = ...`).

Run: `npm test`
Expected: suíte inteira passando.

---

### Task 2: Paleta, diorama, cerca amarela e fundo limpo

**Files:**
- Modify: `src/scene/materials.ts`, `src/data/yard.ts`, `src/scene/environment/Ground.tsx`, `src/scene/environment/Fence.tsx`, `src/scene/environment/Lighting.tsx`, `src/scene/environment/Trees.tsx`, `src/scene/conductors/Conductor.tsx`
- Create: `src/data/trees.ts`
- Test: `src/data/trees.test.ts` (novo), `src/data/cameraLimits.test.ts` (acrescenta um teste)

**Interfaces:**
- Consumes: `CAMERA_LIMITS` (Task 1), `YARD`, `YARD_SIZE` (`src/data/yard.ts`).
- Produces:
  - `SLAB_SIZE = { width: 96, depth: 60 }` em `src/data/yard.ts`.
  - `TREE_POSITIONS: Vec3[]` em `src/data/trees.ts`.
  - `PALETTE`/`MATERIALS` com as chaves novas `background`, `cabinet`, `cable`, `soil`, `fencePanel` (a chave `sky` deixa de existir).

- [ ] **Step 1: Escrever os testes que falham**

`src/data/trees.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { TREE_POSITIONS } from './trees';
import { SLAB_SIZE, YARD, YARD_SIZE } from './yard';

const FOLIAGE_MARGIN = 3;

describe('TREE_POSITIONS', () => {
  it('keeps every tree on the slab with room for the foliage', () => {
    for (const [x, , z] of TREE_POSITIONS) {
      expect(Math.abs(x)).toBeLessThanOrEqual(SLAB_SIZE.width / 2 - FOLIAGE_MARGIN);
      expect(Math.abs(z)).toBeLessThanOrEqual(SLAB_SIZE.depth / 2 - FOLIAGE_MARGIN);
    }
  });

  it('keeps every tree outside the fence', () => {
    for (const [x, , z] of TREE_POSITIONS) {
      const insideFence = Math.abs(x) <= YARD_SIZE.width / 2 + 1 && Math.abs(z) <= YARD_SIZE.depth / 2 + 1;
      expect(insideFence).toBe(false);
    }
  });

  it('keeps every tree away from the admin building', () => {
    const [bx, , bz] = YARD.building.position;
    for (const [x, , z] of TREE_POSITIONS) {
      expect(Math.hypot(x - bx, z - bz)).toBeGreaterThanOrEqual(10);
    }
  });
});
```

Em `src/data/cameraLimits.test.ts`, acrescente o import `import { SLAB_SIZE } from './yard';` junto dos outros e este bloco no final do arquivo:

```ts
describe('CAMERA_LIMITS.bounds', () => {
  it('stays inside the slab', () => {
    const { min, max } = CAMERA_LIMITS.bounds;
    expect(Math.abs(min[0])).toBeLessThanOrEqual(SLAB_SIZE.width / 2);
    expect(Math.abs(max[0])).toBeLessThanOrEqual(SLAB_SIZE.width / 2);
    expect(Math.abs(min[2])).toBeLessThanOrEqual(SLAB_SIZE.depth / 2);
    expect(Math.abs(max[2])).toBeLessThanOrEqual(SLAB_SIZE.depth / 2);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/data/trees.test.ts src/data/cameraLimits.test.ts`
Expected: FAIL (`./trees` não existe; `SLAB_SIZE` não é exportado de `./yard`).

- [ ] **Step 3: Implementar os dados**

Em `src/data/yard.ts`, logo depois da linha `export const YARD_SIZE = { width: 60, depth: 40 } as const;`, acrescente:

```ts
export const SLAB_SIZE = { width: 96, depth: 60 } as const;
```

`src/data/trees.ts`:

```ts
import type { Vec3 } from './types';

export const TREE_POSITIONS: Vec3[] = [
  [-36, 0, -18],
  [-40, 0, -2],
  [-36, 0, 14],
  [-20, 0, 24],
  [0, 0, 25],
  [22, 0, 24],
  [36, 0, -22],
  [20, 0, -25],
  [-22, 0, -25],
  [42, 0, 16],
  [44, 0, -14],
  [-8, 0, -26],
];
```

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `npx vitest run src/data/trees.test.ts src/data/cameraLimits.test.ts`
Expected: todos passando.

- [ ] **Step 5: Paleta, diorama, cerca, luz e árvores**

Em `src/scene/materials.ts`, troque o objeto `PALETTE` inteiro por:

```ts
export const PALETTE = {
  background: '#f3f6fa',
  transformer: '#a9bccd',
  accent: '#f5a623',
  steel: '#c4cfda',
  porcelain: '#8a4f2f',
  aluminum: '#e4e9ee',
  cabinet: '#dfe6ec',
  cable: '#4b5663',
  gravel: '#c9c3b8',
  grass: '#8bc34a',
  soil: '#8c8472',
  fence: '#f2b705',
  fencePanel: '#ffc83d',
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
```

e, logo depois da linha `MATERIALS.screenOn.emissiveIntensity = 0.8;`, acrescente:

```ts
MATERIALS.fencePanel.transparent = true;
MATERIALS.fencePanel.opacity = 0.3;
MATERIALS.fencePanel.depthWrite = false;
```

`src/scene/environment/Ground.tsx` (substitui o conteúdo):

```tsx
import { SLAB_SIZE, YARD_SIZE } from '../../data/yard';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

const GRASS_THICKNESS = 0.6;
const SOIL_THICKNESS = 2.4;
const PAD_THICKNESS = 0.1;

export function Ground() {
  const grassTop = -0.05;
  return (
    <>
      <Block
        size={[SLAB_SIZE.width, SOIL_THICKNESS, SLAB_SIZE.depth]}
        position={[0, grassTop - GRASS_THICKNESS - SOIL_THICKNESS / 2, 0]}
        material={MATERIALS.soil}
      />
      <Block
        size={[SLAB_SIZE.width, GRASS_THICKNESS, SLAB_SIZE.depth]}
        position={[0, grassTop - GRASS_THICKNESS / 2, 0]}
        material={MATERIALS.grass}
      />
      <Block
        size={[YARD_SIZE.width, PAD_THICKNESS, YARD_SIZE.depth]}
        position={[0, -PAD_THICKNESS / 2, 0]}
        material={MATERIALS.gravel}
      />
    </>
  );
}
```

`src/scene/environment/Lighting.tsx` (substitui o conteúdo):

```tsx
import { PALETTE } from '../materials';

export function Lighting() {
  return (
    <>
      <color attach="background" args={[PALETTE.background]} />
      <hemisphereLight args={['#ffffff', PALETTE.grass, 0.9]} />
      <directionalLight
        position={[-30, 50, 30]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />
    </>
  );
}
```

`src/scene/environment/Fence.tsx` (substitui o conteúdo):

```tsx
import { Instance, Instances } from '@react-three/drei';
import type { Vec3 } from '../../data/types';
import { YARD_SIZE } from '../../data/yard';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { fencePosts } from './fencePosts';

const POSTS = fencePosts(YARD_SIZE.width, YARD_SIZE.depth, 3);
const POST_HEIGHT = 1.8;
const RAIL_HEIGHTS = [0.8, 1.6];
const PANEL_HEIGHT = 1.2;
const PANEL_Y = 1;

function FencePanel({ size, position }: { size: Vec3; position: Vec3 }) {
  return (
    <mesh position={position} material={MATERIALS.fencePanel}>
      <boxGeometry args={size} />
    </mesh>
  );
}

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
      <FencePanel size={[YARD_SIZE.width, PANEL_HEIGHT, 0.04]} position={[0, PANEL_Y, -halfZ]} />
      <FencePanel size={[YARD_SIZE.width, PANEL_HEIGHT, 0.04]} position={[0, PANEL_Y, halfZ]} />
      <FencePanel size={[0.04, PANEL_HEIGHT, YARD_SIZE.depth]} position={[-halfX, PANEL_Y, 0]} />
      <FencePanel size={[0.04, PANEL_HEIGHT, YARD_SIZE.depth]} position={[halfX, PANEL_Y, 0]} />
    </>
  );
}
```

`src/scene/environment/Trees.tsx`: apague a constante local `TREE_POSITIONS` e o import de `Vec3`, e importe a lista dos dados. O topo do arquivo fica:

```tsx
import { TREE_POSITIONS } from '../../data/trees';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';
```

(o componente `Trees` continua igual).

Em `src/scene/conductors/Conductor.tsx`, troque `MATERIALS.aluminum` por `MATERIALS.cable`.

- [ ] **Step 6: Verificar**

Run: `npm run typecheck`
Expected: sem erros (se algum arquivo ainda usar `PALETTE.sky`, troque por `PALETTE.background`).

Run: `npm test`
Expected: suíte inteira passando.

---

### Task 3: Transformador de três buchas

**Files:**
- Modify: `src/scene/equipment/PowerTransformer.tsx` (reescrita)

**Interfaces:**
- Consumes: `TERMINALS.transformer`, `Insulator`, `Block`, `Cylinder`, `MATERIALS` (`steel`, `transformer`, `cabinet`).
- Produces: o mesmo `PowerTransformer(props: EquipmentProps)` e o mesmo `CONSERVATOR` exportado (usado pelo teste de folga), com as buchas centrais ainda terminando nos terminais `hv1` e `lv1`.

- [ ] **Step 1: Reescrever o componente**

`src/scene/equipment/PowerTransformer.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_HEIGHT = 0.4;
const TANK_TOP = 3.4;
const HV_PITCH = 1.2;
const LV_PITCH = 1;
const PHASES = [-1, 0, 1];
const FIN_XS = [-1.6, -0.8, 0, 0.8, 1.6];

export const CONSERVATOR = { radius: 0.6, length: 2.6, y: TANK_TOP + 0.8 } as const;

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
        outline
      />
      {[-1, 1].flatMap((side) =>
        FIN_XS.map((x) => (
          <Block key={`${side}:${x}`} size={[0.2, 2.2, 0.9]} position={[x, 1.9, side * 2.2]} material={MATERIALS.steel} />
        )),
      )}
      <Cylinder
        radius={CONSERVATOR.radius}
        height={CONSERVATOR.length}
        position={[0, CONSERVATOR.y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MATERIALS.steel}
      />
      {[-0.8, 0.8].map((z) => (
        <Block key={z} size={[0.3, 0.3, 0.3]} position={[0, TANK_TOP + 0.1, z]} material={MATERIALS.steel} />
      ))}
      {PHASES.map((phase) => (
        <Insulator
          key={`hv${phase}`}
          position={[hv1[0], TANK_TOP, hv1[2] + phase * HV_PITCH]}
          height={hv1[1] - TANK_TOP}
          radius={0.2}
          discs={5}
        />
      ))}
      {PHASES.map((phase) => (
        <Insulator
          key={`lv${phase}`}
          position={[lv1[0], TANK_TOP, lv1[2] + phase * LV_PITCH]}
          height={lv1[1] - TANK_TOP}
          radius={0.16}
          discs={3}
        />
      ))}
      <Block size={[0.5, 1.2, 0.9]} position={[2.75, 1.7, -1]} material={MATERIALS.cabinet} radius={0.05} />
    </group>
  );
}
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npx vitest run src/scene/conductors/clearance.test.ts`
Expected: PASS (nenhum condutor entra no conservador, que manteve posição e raio).

Run: `npm test`
Expected: suíte inteira passando.

---

### Task 4: Equipamentos trifásicos

**Files:**
- Create: `src/scene/equipment/phases.ts`
- Modify: `src/scene/equipment/CircuitBreaker.tsx`, `Disconnector.tsx`, `CurrentTransformer.tsx`, `PotentialTransformer.tsx`, `SurgeArrester.tsx` (todos em `src/scene/equipment/`, reescritos)

**Interfaces:**
- Consumes: `TERMINALS`, `Insulator`, `Block`, `Cylinder`, `MATERIALS` (`steel`, `aluminum`, `cabinet`).
- Produces: `PHASE_PITCH = 1.4` e `PHASE_OFFSETS: readonly number[]` em `phases.ts`; os cinco componentes mantêm assinatura `(props: EquipmentProps)` e as colunas da fase central continuam terminando nos terminais.

- [ ] **Step 1: Criar `phases.ts`**

`src/scene/equipment/phases.ts`:

```ts
export const PHASE_PITCH = 1.4;
export const PHASE_OFFSETS: readonly number[] = [-PHASE_PITCH, 0, PHASE_PITCH];
```

- [ ] **Step 2: Reescrever os cinco equipamentos**

`src/scene/equipment/CircuitBreaker.tsx`:

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import { PHASE_OFFSETS, PHASE_PITCH } from './phases';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.5;
const BASE_DEPTH = PHASE_PITCH * 2 + 1.2;

export function CircuitBreaker({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.breaker;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2.4, BASE_TOP, BASE_DEPTH]} position={[0, BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      {PHASE_OFFSETS.map((z) => (
        <group key={z}>
          <Insulator position={[inlet[0], BASE_TOP, inlet[2] + z]} height={inlet[1] - BASE_TOP} radius={0.2} />
          <Insulator position={[outlet[0], BASE_TOP, outlet[2] + z]} height={outlet[1] - BASE_TOP} radius={0.2} />
        </group>
      ))}
      <Block size={[0.8, 0.9, 0.6]} position={[0, 0.45, -(BASE_DEPTH / 2 + 0.6)]} material={MATERIALS.cabinet} radius={0.05} />
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
import { PHASE_OFFSETS, PHASE_PITCH } from './phases';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.3;
const FRAME_DEPTH = PHASE_PITCH * 2 + 0.3;

export function Disconnector({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.disconnector;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[0.3, BASE_TOP, FRAME_DEPTH]} position={[inlet[0], BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      <Block size={[0.3, BASE_TOP, FRAME_DEPTH]} position={[outlet[0], BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      {PHASE_OFFSETS.map((z) => (
        <group key={z}>
          <Insulator position={[inlet[0], BASE_TOP, inlet[2] + z]} height={inlet[1] - BASE_TOP} radius={0.2} />
          <Insulator position={[outlet[0], BASE_TOP, outlet[2] + z]} height={outlet[1] - BASE_TOP} radius={0.2} />
          <Block
            size={[outlet[0] - inlet[0], 0.12, 0.12]}
            position={[0, inlet[1] + 0.06, z]}
            material={MATERIALS.aluminum}
          />
        </group>
      ))}
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
import { PHASE_OFFSETS } from './phases';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.5;
const HEAD_HEIGHT = 0.6;

export function CurrentTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const headY = TERMINALS.ct.in[1];
  return (
    <group position={position} rotation-y={rotationY}>
      {PHASE_OFFSETS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Block size={[1, PEDESTAL, 1]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
          <Insulator position={[0, PEDESTAL, 0]} height={headY - HEAD_HEIGHT / 2 - PEDESTAL} radius={0.28} />
          <Block size={[1, HEAD_HEIGHT, 0.7]} position={[0, headY, 0]} material={MATERIALS.aluminum} radius={0.12} />
        </group>
      ))}
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
import { PHASE_OFFSETS } from './phases';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.5;
const CAP_HEIGHT = 0.3;

export function PotentialTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const topY = TERMINALS.pt.top[1];
  return (
    <group position={position} rotation-y={rotationY}>
      {PHASE_OFFSETS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Block size={[1, PEDESTAL, 1]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
          <Insulator position={[0, PEDESTAL, 0]} height={topY - PEDESTAL - CAP_HEIGHT} radius={0.3} />
          <Cylinder radius={0.4} height={CAP_HEIGHT} position={[0, topY - CAP_HEIGHT / 2, 0]} material={MATERIALS.aluminum} />
        </group>
      ))}
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
import { PHASE_OFFSETS } from './phases';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.3;
const CAP_HEIGHT = 0.2;

export function SurgeArrester({ position, rotationY = 0 }: EquipmentProps) {
  const topY = TERMINALS.arrester.top[1];
  return (
    <group position={position} rotation-y={rotationY}>
      {PHASE_OFFSETS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Block size={[0.8, PEDESTAL, 0.8]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
          <Insulator position={[0, PEDESTAL, 0]} height={topY - PEDESTAL - CAP_HEIGHT / 2} radius={0.16} discs={6} />
          <Cylinder radius={0.12} height={CAP_HEIGHT} position={[0, topY - CAP_HEIGHT / 2, 0]} material={MATERIALS.aluminum} />
        </group>
      ))}
    </group>
  );
}
```

- [ ] **Step 3: Verificar**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm test`
Expected: suíte inteira passando (o teste de folga continua verde).

---

### Task 5: Pórtico de treliça, armários e novo layout

**Files:**
- Create: `src/scene/equipment/Lattice.tsx`, `src/scene/equipment/ControlCabinet.tsx`
- Modify: `src/data/types.ts`, `src/data/terminals.ts`, `src/scene/equipment/Gantry.tsx` (reescrita), `src/scene/equipment/registry.tsx`, `src/data/yard.ts`
- Test: `src/data/validate.test.ts`, `src/data/yard.test.ts` (acrescentam um teste cada); `src/scene/equipment/registry.test.ts` não muda e passa a falhar até o componente existir

**Interfaces:**
- Consumes: `Insulator`, `Block`, `MATERIALS`, `EquipmentProps`.
- Produces:
  - `EquipmentType` ganha `'cabinet'`; `TERMINALS.cabinet = {}`; `TERMINALS.gantry.mid` passa a `[0, 3.8, 0]` (base da cadeia de isoladores central).
  - `Lattice({ length: number; width: number; segments: number; material: Material })`: treliça plana vertical, com a base na origem e o topo em `y = length`.
  - `ControlCabinet(props: EquipmentProps)`, com a frente voltada para `+x`.
  - `registry` mapeia `cabinet` para `ControlCabinet`.

- [ ] **Step 1: Escrever os testes que falham**

Em `src/data/validate.test.ts`, acrescente este teste dentro do `describe('validateYard')`, antes do teste `'reports unknown equipment types and drops their connections'`:

```ts
  it('rejects a connection to equipment that has no terminals', () => {
    const yard = baseYard({
      equipment: [
        { id: 't1', type: 'transformer', position: [0, 0, 0] },
        { id: 'cb1', type: 'cabinet', position: [10, 0, 0] },
      ],
      connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'cb1', terminal: 'top' } }],
    });
    const result = validateYard(yard);
    expect(result.validConnections).toHaveLength(0);
    expect(result.errors[0]).toContain('has no terminal "top"');
  });
```

Em `src/data/yard.test.ts`, acrescente dentro do `describe('YARD')`:

```ts
  it('has at least two control cabinets', () => {
    expect(YARD.equipment.filter((item) => item.type === 'cabinet').length).toBeGreaterThanOrEqual(2);
  });
```

Em `src/data/types.ts`, troque a união `EquipmentType` por (acrescenta `'cabinet'`):

```ts
export type EquipmentType =
  | 'transformer'
  | 'breaker'
  | 'disconnector'
  | 'ct'
  | 'pt'
  | 'arrester'
  | 'gantry'
  | 'busbar'
  | 'cabinet';
```

Em `src/data/terminals.ts`, troque as linhas `gantry` e `busbar` e acrescente `cabinet`:

```ts
  gantry: { left: [-4, 6, 0], mid: [0, 3.8, 0], right: [4, 6, 0] },
  busbar: { a: [-12, 4, 0], tap1: [-8, 4, 0], tap2: [8, 4, 0], b: [12, 4, 0] },
  cabinet: {},
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npm test`
Expected: FAIL em `registry.test.ts` (`cabinet` ainda resolve para o placeholder), em `validate.test.ts` (a mensagem é "has unknown type", não "has no terminal") e em `yard.test.ts` (nenhum armário). O typecheck também falha, porque `registry.tsx` ainda não tem a chave `cabinet`.

- [ ] **Step 3: Criar a treliça, o pórtico e o armário**

`src/scene/equipment/Lattice.tsx`:

```tsx
import type { Material } from 'three';
import { Block } from '../primitives';

interface LatticeProps {
  length: number;
  width: number;
  segments: number;
  material: Material;
}

export function Lattice({ length, width, segments, material }: LatticeProps) {
  const step = length / segments;
  const diagonal = Math.hypot(width, step);
  const tilt = Math.atan2(width, step);
  return (
    <group>
      {[-1, 1].map((side) => (
        <Block key={side} size={[0.14, length, 0.14]} position={[(side * width) / 2, length / 2, 0]} material={material} />
      ))}
      {Array.from({ length: segments + 1 }, (_, index) => (
        <Block key={`rung${index}`} size={[width, 0.08, 0.08]} position={[0, index * step, 0]} material={material} />
      ))}
      {Array.from({ length: segments }, (_, index) => (
        <Block
          key={`diag${index}`}
          size={[0.07, diagonal, 0.07]}
          position={[0, (index + 0.5) * step, 0]}
          rotation={[0, 0, (index % 2 === 0 ? -1 : 1) * tilt]}
          material={material}
        />
      ))}
    </group>
  );
}
```

`src/scene/equipment/Gantry.tsx` (substitui o conteúdo):

```tsx
import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Insulator } from './Insulator';
import { Lattice } from './Lattice';
import type { EquipmentProps } from './props';

const COLUMN_WIDTH = 0.7;
const BEAM_DEPTH = 0.6;
const STRING_XS = [-1.5, 0, 1.5];

export function Gantry({ position, rotationY = 0 }: EquipmentProps) {
  const { left, right, mid } = TERMINALS.gantry;
  const height = left[1];
  const span = right[0] - left[0];
  return (
    <group position={position} rotation-y={rotationY}>
      {[left[0], right[0]].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Lattice length={height} width={COLUMN_WIDTH} segments={5} material={MATERIALS.steel} />
        </group>
      ))}
      <group position={[right[0], height - BEAM_DEPTH / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Lattice length={span} width={BEAM_DEPTH} segments={8} material={MATERIALS.steel} />
      </group>
      {STRING_XS.map((x) => (
        <Insulator key={x} position={[x, mid[1], 0]} height={height - BEAM_DEPTH - mid[1]} radius={0.1} discs={6} />
      ))}
    </group>
  );
}
```

`src/scene/equipment/ControlCabinet.tsx`:

```tsx
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import type { EquipmentProps } from './props';

export function ControlCabinet({ position, rotationY = 0 }: EquipmentProps) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[1.1, 0.2, 0.9]} position={[0, 0.1, 0]} material={MATERIALS.steel} />
      <Block size={[1, 2, 0.8]} position={[0, 1.2, 0]} material={MATERIALS.cabinet} radius={0.04} />
      <Block size={[0.02, 1.7, 0.7]} position={[0.51, 1.2, 0]} material={MATERIALS.steel} />
      <Block size={[0.02, 0.25, 0.25]} position={[0.52, 1.8, 0.2]} material={MATERIALS.accent} />
    </group>
  );
}
```

- [ ] **Step 4: Registro e layout**

Em `src/scene/equipment/registry.tsx`, acrescente o import `import { ControlCabinet } from './ControlCabinet';` (junto dos outros, em ordem alfabética) e, no objeto `EQUIPMENT_COMPONENTS`, a linha `cabinet: ControlCabinet,` depois de `busbar: Busbar,`.

Em `src/data/yard.ts`:
1. No array `equipment`, depois da linha do `bb1`, acrescente:

```ts
    { id: 'cb1', type: 'cabinet', position: [20, 0, -4], rotationY: Math.PI },
    { id: 'cb2', type: 'cabinet', position: [22.2, 0, -4], rotationY: Math.PI },
```

2. Na primeira conexão (`g1.mid` → `d1.in`), troque `sag: 1` por `sag: 0.6`.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm test`
Expected: suíte inteira passando (registro com 9 tipos, validação e layout com os armários).

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm run build`
Expected: build concluído.

---

### Task 6: Verificação visual e documentação

**Files:**
- Modify: `docs/roadmap.md`, `docs/superpowers/specs/2026-10-07-parte-1-patio-3d-design.md`, este plano (seção Status)

- [ ] **Step 1: Capturar os pontos de vista**

Suba o servidor (`npx vite --port 5199 --strictPort`) e capture, com o Chrome headless e a depuração remota, a visão geral e os três outros pontos de vista do tour (clicando nos botões `.tour button`). Confirme que o console não mostra erros.

- [ ] **Step 2: Comparar com as referências**

Abra as capturas e compare com `public/istockphoto-1463961464-612x612.jpg` e `public/istockphoto-1463801943-612x612.jpg`. Marque cada item:

- [ ] O diorama aparece como uma placa com borda de grama sobre fundo claro, sem horizonte.
- [ ] A câmera está em isométrica (as linhas paralelas não convergem).
- [ ] A cerca é amarela, com painéis translúcidos.
- [ ] Os transformadores têm três buchas de AT, três de BT, aletas laterais e caixa de comando.
- [ ] Seccionadora, disjuntor, TC, TP e para-raios aparecem em três colunas.
- [ ] O pórtico é de treliça e tem cadeias de isoladores penduradas.
- [ ] Os dois armários aparecem no lado leste do pátio.
- [ ] Os condutores são escuros e chegam à fase central de cada equipamento, sem atravessar buchas ou conservadores.
- [ ] A sala de monitoramento continua legível com o telhado aberto.

Se algum item falhar, ajuste a geometria ou o layout correspondente (dimensões, posições, cores) e capture de novo.

- [ ] **Step 3: Atualizar a documentação**

Em `docs/roadmap.md`, troque o plano da Parte 1 por dois links e o status por "Revisão 2 (referências visuais) implementada, aguardando revisão". Em `docs/superpowers/specs/2026-10-07-parte-1-patio-3d-design.md`, troque a linha `Status` para "Revisão 2 (referências visuais) implementada, aguardando revisão". Preencha a seção Status deste plano.

- [ ] **Step 4: Listar os arquivos alterados**

Liste para o usuário todos os arquivos criados e alterados, para ele fazer o commit.

---

## Status

Executado em 2026-10-07. As 6 tasks foram concluídas; 89 testes passando; typecheck e build ok. A verificação visual foi feita com capturas do Chrome headless dos quatro pontos de vista. Medir fps em GPU real e em celular continua pendente (abra a página com `?stats`).
