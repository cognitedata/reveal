import {
  getMockWellboreMeasurementsMap,
  getMockDepthMeasurementColumns,
  getMockDepthMeasurementColumn,
} from '__test-utils/fixtures/measurements';
import { MeasurementTypeV3 as MeasurementType } from 'modules/wellSearch/types';

import {
  getSortedUniqCurves,
  filterCurvesByMeasurementTypes,
  getUniqCurvesOfMeasurementType,
  getUniqGeomechanicsCurves,
  getUniqPpfgCurves,
  getUniqOtherCurves,
} from '../utils';

describe('Measurement filter utils', () => {
  /**
   * getSortedUniqCurves
   */

  test('Should get unique curves', () => {
    expect(getSortedUniqCurves(getMockWellboreMeasurementsMap())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnExternalId: 'FP_CARBONATE_ML' }),
        expect.objectContaining({ columnExternalId: 'FP_SHALE_HIGH' }),
        expect.objectContaining({ columnExternalId: 'PP_COMPOSITE_ML' }),
        expect.objectContaining({ columnExternalId: 'SVERTICAL_PRE' }),
      ])
    );
  });

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
