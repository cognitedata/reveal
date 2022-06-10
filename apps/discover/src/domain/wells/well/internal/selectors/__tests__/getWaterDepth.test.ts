import { getMockWell } from '__test-utils/fixtures/well';

import { getWaterDepth } from '../getWaterDepth';

describe('getWaterDepth', () => {
  it('should be ok', () => {
    expect(getWaterDepth(getMockWell())).toEqual({ unit: 'ft', value: 23.523 });
  });
});
