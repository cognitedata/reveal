import { UserPreferredUnit } from 'constants/units';

import { getMDFilter } from '../getMDFilter';

describe('getMDFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getMDFilter('')).toEqual({});
    expect(getMDFilter([10, 20])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getMDFilter([10, 20], UserPreferredUnit.FEET)).toEqual({
      trajectories: { maxMeasuredDepth: { min: 10, max: 20, unit: 'foot' } },
    });
  });
});
