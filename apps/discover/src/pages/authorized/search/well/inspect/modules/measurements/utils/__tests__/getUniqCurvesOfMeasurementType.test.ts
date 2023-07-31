import {
  getMockDepthMeasurementDataColumnsCurves,
  getMockMeasurement,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { MeasurementType } from 'modules/wellSearch/types';

import { getUniqCurvesOfMeasurementType } from '../getUniqCurvesOfMeasurementType';

describe('getUniqCurvesOfMeasurementType', () => {
  const measurement = getMockMeasurement({
    columns: getMockDepthMeasurementDataColumnsCurves(),
  });

  test('getUniqCurvesOfMeasurementType: Should contain lot and fit columns only', () => {
    const result = getUniqCurvesOfMeasurementType(
      [MeasurementType.LOT, MeasurementType.FIT],
      [measurement]
    );
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

  test('getUniqCurvesOfMeasurementType: Should contain ppfg columns only', () => {
    const result = getUniqCurvesOfMeasurementType(
      [MeasurementType.PPFG],
      [measurement]
    );
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

  /**
   * getUniqCurvesOfMeasurementType
   */

  test('getUniqCurvesOfMeasurementType: Should contain geomechanics columns only', () => {
    const result = getUniqCurvesOfMeasurementType(
      [MeasurementType.GEOMECHANNICS],
      [measurement]
    );
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
