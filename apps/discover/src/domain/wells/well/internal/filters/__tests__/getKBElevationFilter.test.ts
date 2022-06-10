import { UserPreferredUnit } from 'constants/units';

import { getKBElevationFilter } from '../getKBElevationFilter';

describe('getKBElevationFilter', () => {
  it('should return empty object with invalid input and with number tuple', () => {
    expect(getKBElevationFilter('')).toEqual({});
    expect(getKBElevationFilter([10, 20])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getKBElevationFilter([10, 20], UserPreferredUnit.FEET)).toEqual({
      datum: { min: 10, max: 20, unit: 'foot' },
    });
  });
});
