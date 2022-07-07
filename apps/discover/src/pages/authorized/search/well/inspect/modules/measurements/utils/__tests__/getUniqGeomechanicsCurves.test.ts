import {
  getMockDepthMeasurementDataColumnsCurves,
  getMockMeasurement,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { getUniqGeomechanicsCurves } from '../getUniqGeomechanicsCurves';

describe('Measurement filter utils', () => {
  /**
   * getUniqGeomechanicsCurves
   */

  test('getUniqGeomechanicsCurves: Should contain geomechanics columns only', () => {
    const measurement = getMockMeasurement({
      columns: getMockDepthMeasurementDataColumnsCurves(),
    });

    const result = getUniqGeomechanicsCurves([measurement]);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'SVERTICAL_PRE' }),
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ externalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ externalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ externalId: 'LOT_1' }),
        expect.objectContaining({ externalId: 'FIT_1' }),
        expect.objectContaining({ externalId: 'BAD_MES_TYPE' }),
      ])
    );
  });
});
