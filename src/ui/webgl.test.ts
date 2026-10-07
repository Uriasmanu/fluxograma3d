import { describe, expect, it, vi } from 'vitest';
import { createWebGL2Check } from './webgl';

const canvasWith = (context: unknown) => ({ getContext: vi.fn(() => context) }) as unknown as HTMLCanvasElement;

describe('createWebGL2Check', () => {
  it('probes only once and releases the probe context', () => {
    const loseContext = vi.fn();
    const context = { getExtension: vi.fn(() => ({ loseContext })) };
    const createCanvas = vi.fn(() => canvasWith(context));
    const check = createWebGL2Check(createCanvas);

    expect(check()).toBe(true);
    expect(check()).toBe(true);
    expect(createCanvas).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('reports no support when webgl2 is unavailable', () => {
    expect(createWebGL2Check(() => canvasWith(null))()).toBe(false);
  });

  it('reports no support when the probe throws', () => {
    const check = createWebGL2Check(() => {
      throw new Error('blocked');
    });
    expect(check()).toBe(false);
  });

  it('still reports support when the context has no lose-context extension', () => {
    const context = { getExtension: vi.fn(() => null) };
    expect(createWebGL2Check(() => canvasWith(context))()).toBe(true);
  });
});
