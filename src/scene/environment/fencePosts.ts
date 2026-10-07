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
