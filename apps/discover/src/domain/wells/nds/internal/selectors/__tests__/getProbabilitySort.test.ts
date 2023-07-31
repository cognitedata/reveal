import { getProbabilitySort } from '../getProbabilitySort';

describe('getProbabilitySort', () => {
  it('should sort ascending', () => {
    expect(
      getProbabilitySort({ probability: 0 }, { probability: 10 })
    ).toBeLessThan(0);

    expect(getProbabilitySort({}, { probability: 10 })).toBeLessThan(0);
    expect(getProbabilitySort({ probability: 0 }, {})).toBeLessThan(0);
    expect(getProbabilitySort({}, {})).toBeLessThan(0);
  });

  it('should sort descending', () => {
    expect(
      getProbabilitySort({ probability: 10 }, { probability: 0 })
    ).toBeGreaterThan(0);
  });
});
