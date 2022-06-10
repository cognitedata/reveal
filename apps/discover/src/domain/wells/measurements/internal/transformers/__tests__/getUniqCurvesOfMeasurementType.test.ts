import { getMockWellboreMeasurementsMap } from '__test-utils/fixtures/measurements';
import { MeasurementTypeV3 as MeasurementType } from 'modules/wellSearch/types';

import { getUniqCurvesOfMeasurementType } from '../getUniqCurvesOfMeasurementType';

describe('getUniqCurvesOfMeasurementType', () => {
  test('getUniqCurvesOfMeasurementType: Should contain lot and fit columns only', () => {
    const wellboreMeasurementMap = getMockWellboreMeasurementsMap();
    const result = getUniqCurvesOfMeasurementType(
      [MeasurementType.LOT, MeasurementType.FIT],
      wellboreMeasurementMap
    );
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

  test('getUniqCurvesOfMeasurementType: Should contain ppfg columns only', () => {
    const wellboreMeasurementMap = getMockWellboreMeasurementsMap();
    const result = getUniqCurvesOfMeasurementType(
      [MeasurementType.PPFG],
      wellboreMeasurementMap
    );
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

  /**
   * getUniqCurvesOfMeasurementType
   */

  test('getUniqCurvesOfMeasurementType: Should contain geomechanics columns only', () => {
    const wellboreMeasurementMap = getMockWellboreMeasurementsMap();
    const result = getUniqCurvesOfMeasurementType(
      [MeasurementType.GEOMECHANNICS],
      wellboreMeasurementMap
    );
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
