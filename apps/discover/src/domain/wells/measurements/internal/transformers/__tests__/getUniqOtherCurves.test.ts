import { getMockWellboreMeasurementsMap } from '__test-utils/fixtures/measurements';

import { getUniqOtherCurves } from '../getUniqOtherCurves';

describe('Measurement filter utils', () => {
  /**
   * getUniqOtherCurves
   */

  test('getUniqOtherCurves: Should contain lot and fit columns only', () => {
    const wellboreMeasurementMap = getMockWellboreMeasurementsMap();
    const result = getUniqOtherCurves(wellboreMeasurementMap);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'LOT_1' }),
        expect.objectContaining({ columnExternalId: 'FIT_1' }),
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'SVERTICAL_PRE' }),
        expect.objectContaining({ columnExternalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ columnExternalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ columnExternalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ columnExternalId: 'BAD_MES_TYPE' }),
      ])
    );
  });
});
