import {
  getMockDepthMeasurementColumns,
  getMockDepthMeasurementColumn,
} from '__test-utils/fixtures/measurements';
import { MeasurementTypeV3 as MeasurementType } from 'modules/wellSearch/types';

import { filterCurvesByMeasurementTypes } from '../filterCurvesByMeasurementTypes';

describe('filterCurvesByMeasurementTypes', () => {
  /**
   * filterCurvesByMeasurementTypes
   */

  test('Should contain geomechanics columns only', () => {
    const depthMeasurementColumns = [
      ...getMockDepthMeasurementColumns(),
      getMockDepthMeasurementColumn({
        measurementType: 'bad measurement type',
        columnExternalId: 'BAD_MES_TYPE',
      }),
    ];
    const result = filterCurvesByMeasurementTypes(
      [MeasurementType.GEOMECHANNICS],
      depthMeasurementColumns
    );
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'SVERTICAL_PRE' }),
        expect.objectContaining({ columnExternalId: 'SHMIN_SAND_ML_PRE' }),
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

  test('Should contain ppfg columns only', () => {
    const depthMeasurementColumns = [
      ...getMockDepthMeasurementColumns(),
      getMockDepthMeasurementColumn({
        measurementType: 'bad measurement type',
      }),
    ];
    const result = filterCurvesByMeasurementTypes(
      [MeasurementType.PPFG],
      depthMeasurementColumns
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

  test('Should contain lot and fit columns only', () => {
    const depthMeasurementColumns = [
      ...getMockDepthMeasurementColumns(),
      getMockDepthMeasurementColumn({
        measurementType: 'bad measurement type',
      }),
    ];
    const result = filterCurvesByMeasurementTypes(
      [MeasurementType.LOT, MeasurementType.FIT],
      depthMeasurementColumns
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
});
