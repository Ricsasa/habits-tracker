import { addOneHour, combineDateTime, currentTimeValue, timeInputValue } from '@/lib/locale-utils';

describe('combineDateTime', () => {
  it('returns an absolute timestamp that round-trips to the same wall clock', () => {
    const timestamp = combineDateTime('2026-08-09', '20:00');
    expect(timestamp).toMatch(/Z$/);
    expect(timeInputValue(timestamp)).toBe('20:00');
  });
});

describe('currentTimeValue', () => {
  it('formats the local hour and minute with two digits', () => {
    expect(currentTimeValue(new Date(2026, 7, 9, 9, 5))).toBe('09:05');
  });
});

describe('addOneHour', () => {
  it('adds one hour', () => {
    expect(addOneHour('20:15')).toBe('21:15');
  });

  it('clamps to the end of the day', () => {
    expect(addOneHour('23:30')).toBe('23:59');
  });
});
