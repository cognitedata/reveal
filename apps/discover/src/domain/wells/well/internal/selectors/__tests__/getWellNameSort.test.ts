import { getWellNameSort } from '../getWellNameSort';

describe('getWellNameSort', () => {
  it('should be ok', () => {
    expect(
      getWellNameSort({ wellName: 'WellA' }, { wellName: 'WellB' })
    ).toBeLessThan(0);
  });

  it('should sort descending', () => {
    expect(
      getWellNameSort({ wellName: 'WellB' }, { wellName: 'WellA' })
    ).toBeGreaterThan(0);
  });

  it('should handle undefined values', () => {
    expect(getWellNameSort({}, { wellName: 'WellB' })).toBeLessThan(0);
    expect(getWellNameSort({ wellName: 'WellA' }, {})).toBeGreaterThan(0);
    expect(getWellNameSort({}, {})).toBeLessThan(0);
  });
});
