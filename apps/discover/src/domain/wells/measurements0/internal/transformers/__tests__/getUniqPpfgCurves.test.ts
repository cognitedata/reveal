import { getMockWellboreMeasurementsMap } from '__test-utils/fixtures/measurements';

import { getUniqPpfgCurves } from '../getUniqPpfgCurves';

describe('Measurement filter utils', () => {
  /**
   * getUniqPpfgCurves
   */

  test('getUniqPpfgCurves: Should contain ppfg columns only', () => {
    const wellboreMeasurementMap = getMockWellboreMeasurementsMap();
    const result = getUniqPpfgCurves(wellboreMeasurementMap);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ columnExternalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ columnExternalId: 'PP_COMPOSITE_ML' }),
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'SVERTICAL_PRE' }),
        expect.objectContaining({ columnExternalId: 'LOT_1' }),
        expect.objectContaining({ columnExternalId: 'FIT_1' }),
        expect.objectContaining({ columnExternalId: 'BAD_MES_TYPE' }),
      ])
    );
  });
});
