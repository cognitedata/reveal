import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';

import { CurveSuffix, MeasurementCurveData } from '../types';

import { getCoordinatesDifference } from './getCoordinatesDifference';
import { getDifferenceCurveConfig } from './getDifferenceCurveConfig';
import { getDifferentiableIdPrefixes } from './getDifferentiableIdPrefixes';
import { extractIdPrefix, withSuffix } from './handleId';

export const getDifferenceCurves = (
  curves: MeasurementCurveData[]
): MeasurementCurveData[] => {
  const keyedCurves = keyBy(curves, 'columnExternalId');
  const columnExternalIds = Object.keys(keyedCurves);

  return compact(
    getDifferentiableIdPrefixes(columnExternalIds).map((idPrefix) => {
      const curveLow = keyedCurves[withSuffix(idPrefix, CurveSuffix.LOW)];
      const curveHigh = keyedCurves[withSuffix(idPrefix, CurveSuffix.HIGH)];

      /**
       * If one of low or high curves are missing,
       * cannot calculate the difference.
       */
      if (!curveLow || !curveHigh) {
        return null;
      }

      const { id, measurementTypeParent } = curveLow;

      const columnExternalId = withSuffix(idPrefix, CurveSuffix.DIFF);
      const curveName = `${columnExternalId} (${measurementTypeParent})`;
      const curveDescription = `Difference between ${curveHigh.columnExternalId} and ${curveLow.columnExternalId}`;

      return {
        ...curveLow,
        ...getDifferenceCurveConfig(curveLow.line?.color as string),
        columnExternalId,
        curveName,
        customdata: [curveName, curveDescription],
        id: withSuffix(extractIdPrefix(id), CurveSuffix.DIFF),
        x: getCoordinatesDifference(
          curveHigh.x as (number | null)[],
          curveLow.x as (number | null)[]
        ),
      };
    })
  );
};
