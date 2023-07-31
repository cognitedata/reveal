import { getMockWell } from 'domain/wells/well/service/__fixtures/well';

import { getWaterDepthSort } from '../getWaterDepthSort';

describe('getWaterDepthSort', () => {
  it('should be ok', () => {
    expect(
      getWaterDepthSort(
        getMockWell({
          waterDepth: {
            value: 1000,
            unit: 'meter',
          },
        }),
        getMockWell({
          waterDepth: {
            value: 2000,
            unit: 'meter',
          },
        })
      )
    ).toBeLessThan(0);
  });
  it('should sort descending', () => {
    expect(
      getWaterDepthSort(
        getMockWell({
          waterDepth: {
            value: 2000,
            unit: 'meter',
          },
        }),
        getMockWell({
          waterDepth: {
            value: 1000,
            unit: 'meter',
          },
        })
      )
    ).toBeGreaterThan(0);
  });
});
