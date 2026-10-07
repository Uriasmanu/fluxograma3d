import { MeshStandardMaterial } from 'three';

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

type MaterialName = keyof typeof PALETTE;

const flat = (color: string) => new MeshStandardMaterial({ color, flatShading: true, roughness: 0.9 });

export const MATERIALS = Object.fromEntries(
  (Object.keys(PALETTE) as MaterialName[]).map((name) => [name, flat(PALETTE[name])]),
) as Record<MaterialName, MeshStandardMaterial>;

MATERIALS.screenOn.emissive.set(PALETTE.screenOn);
MATERIALS.screenOn.emissiveIntensity = 0.8;
MATERIALS.fencePanel.transparent = true;
MATERIALS.fencePanel.opacity = 0.3;
MATERIALS.fencePanel.depthWrite = false;

const vestCache = new Map<string, MeshStandardMaterial>();

export function vestMaterial(color: string): MeshStandardMaterial {
  let material = vestCache.get(color);
  if (!material) {
    material = flat(color);
    vestCache.set(color, material);
  }
  return material;
}
