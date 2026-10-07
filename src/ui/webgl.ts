function probeWebGL2(createCanvas: () => HTMLCanvasElement): boolean {
  try {
    const context = createCanvas().getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function createWebGL2Check(createCanvas: () => HTMLCanvasElement): () => boolean {
  let result: boolean | undefined;
  return () => {
    if (result === undefined) result = probeWebGL2(createCanvas);
    return result;
  };
}

export const supportsWebGL2 = createWebGL2Check(() => document.createElement('canvas'));
