import { getMockWellboreMeasurementsMap } from '__test-utils/fixtures/measurements';

import { getUniqGeomechanicsCurves } from '../getUniqGeomechanicsCurves';

describe('Measurement filter utils', () => {
  /**
   * getUniqGeomechanicsCurves
   */

  test('getUniqGeomechanicsCurves: Should contain geomechanics columns only', () => {
    const wellboreMeasurementMap = getMockWellboreMeasurementsMap();
    const result = getUniqGeomechanicsCurves(wellboreMeasurementMap);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'SVERTICAL_PRE' }),
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ columnExternalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ columnExternalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ columnExternalId: 'LOT_1' }),
        expect.objectContaining({ columnExternalId: 'FIT_1' }),
        expect.objectContaining({ columnExternalId: 'BAD_MES_TYPE' }),
      ])
    );
  });
});
