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
