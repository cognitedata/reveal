import { UserPreferredUnit } from 'constants/units';

import { getTVDFilter } from '../getTVDFilter';

describe('getTVDFilter', () => {
  it('should return empty object with empty input', () => {
    expect(getTVDFilter([])).toEqual({});
  });

  it('should return empty object with valid number tuple and undefined unit', () => {
    expect(getTVDFilter([10, 20])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getTVDFilter([10, 20], UserPreferredUnit.FEET)).toEqual({
      trajectories: {
        maxTrueVerticalDepth: { min: 10, max: 20, unit: 'foot' },
      },
    });
  });
});
