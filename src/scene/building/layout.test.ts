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
