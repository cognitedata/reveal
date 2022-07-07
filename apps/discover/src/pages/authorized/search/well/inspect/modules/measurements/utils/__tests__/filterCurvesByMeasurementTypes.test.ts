import {
  getMockDepthMeasurementDataColumnsCurves,
  getMockDepthMeasurementColumn,
} from 'domain/wells/measurements/internal/__fixtures/measurements';

import { MeasurementType } from 'modules/wellSearch/types';

import { filterCurvesByMeasurementTypes } from '../filterCurvesByMeasurementTypes';

describe('filterCurvesByMeasurementTypes', () => {
  /**
   * filterCurvesByMeasurementTypes
   */

  test('Should contain geomechanics columns only', () => {
    const depthMeasurementColumns = [
      ...getMockDepthMeasurementDataColumnsCurves(),
      getMockDepthMeasurementColumn({
        measurementType: 'bad measurement type',
        externalId: 'BAD_MES_TYPE',
      }),
    ];
    const result = filterCurvesByMeasurementTypes(
      [MeasurementType.GEOMECHANNICS],
      depthMeasurementColumns
    );
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'SVERTICAL_PRE' }),
        expect.objectContaining({ externalId: 'SHMIN_SAND_ML_PRE' }),
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

  test('Should contain ppfg columns only', () => {
    const depthMeasurementColumns = [
      ...getMockDepthMeasurementDataColumnsCurves(),
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

  test('Should contain lot and fit columns only', () => {
    const depthMeasurementColumns = [
      ...getMockDepthMeasurementDataColumnsCurves(),
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
