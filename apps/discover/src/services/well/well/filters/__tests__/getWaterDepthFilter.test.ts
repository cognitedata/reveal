import { UserPreferredUnit } from 'constants/units';

import { getWaterDepthFilter } from '../getWaterDepthFilter';

describe('getWaterDepthFilter', () => {
  it('should return empty object with invalid input', () => {
    expect(getWaterDepthFilter([])).toEqual({});
  });

  it('should return empty object with valid number tuple and undefined unit', () => {
    expect(getWaterDepthFilter([10, 20])).toEqual({});
  });

  it('should return expected object with valid input', () => {
    expect(getWaterDepthFilter([10, 20], UserPreferredUnit.FEET)).toEqual({
      waterDepth: { min: 10, max: 20, unit: 'foot' },
    });
  });
});
