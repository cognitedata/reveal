import { getSeveritySort } from '../getSeveritySort';

describe('getSeveritySort', () => {
  it('should sort ascending', () => {
    expect(getSeveritySort({ severity: 0 }, { severity: 10 })).toBeLessThan(0);

    expect(getSeveritySort({}, { severity: 10 })).toBeLessThan(0);
    expect(getSeveritySort({ severity: 0 }, {})).toBeLessThan(0);
    expect(getSeveritySort({}, {})).toBeLessThan(0);
  });

  it('should sort descending', () => {
    expect(getSeveritySort({ severity: 10 }, { severity: 0 })).toBeGreaterThan(
      0
    );
  });
});
