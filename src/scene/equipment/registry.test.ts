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
