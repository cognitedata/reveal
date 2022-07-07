import {
  getMockDepthMeasurementDataColumnsCurves,
  getMockMeasurement,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { getSortedUniqCurves } from '../getSortedUniqCurves';

describe('Measurement filter utils', () => {
  /**
   * getSortedUniqCurves
   */

  test('Should get unique curves', () => {
    const measurement = getMockMeasurement({
      columns: getMockDepthMeasurementDataColumnsCurves(),
    });

    expect(getSortedUniqCurves([measurement])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ externalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ externalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ externalId: 'SVERTICAL_PRE' }),
      ])
    );
  });
});
