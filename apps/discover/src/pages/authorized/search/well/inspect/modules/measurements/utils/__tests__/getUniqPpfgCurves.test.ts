import {
  getMockDepthMeasurementDataColumnsCurves,
  getMockMeasurement,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { getUniqPpfgCurves } from '../getUniqPpfgCurves';

describe('Measurement filter utils', () => {
  /**
   * getUniqPpfgCurves
   */

  test('getUniqPpfgCurves: Should contain ppfg columns only', () => {
    const measurement = getMockMeasurement({
      columns: getMockDepthMeasurementDataColumnsCurves(),
    });

    const result = getUniqPpfgCurves([measurement]);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ externalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ externalId: 'PP_COMPOSITE_ML' }),
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'SVERTICAL_PRE' }),
        expect.objectContaining({ externalId: 'LOT_1' }),
        expect.objectContaining({ externalId: 'FIT_1' }),
        expect.objectContaining({ externalId: 'BAD_MES_TYPE' }),
      ])
    );
  });
});
