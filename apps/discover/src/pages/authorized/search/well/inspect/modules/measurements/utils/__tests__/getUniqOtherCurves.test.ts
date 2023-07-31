import {
  getMockDepthMeasurementDataColumnsCurves,
  getMockMeasurement,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { getUniqOtherCurves } from '../getUniqOtherCurves';

describe('Measurement filter utils', () => {
  /**
   * getUniqOtherCurves
   */

  test('getUniqOtherCurves: Should contain lot and fit columns only', () => {
    const measurement = getMockMeasurement({
      columns: getMockDepthMeasurementDataColumnsCurves(),
    });

    const result = getUniqOtherCurves([measurement]);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'LOT_1' }),
        expect.objectContaining({ externalId: 'FIT_1' }),
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'SVERTICAL_PRE' }),
        expect.objectContaining({ externalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ externalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ externalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ externalId: 'BAD_MES_TYPE' }),
      ])
    );
  });
});
