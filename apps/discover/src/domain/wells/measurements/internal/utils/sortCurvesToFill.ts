import { sortObjectsAscending } from 'utils/sort';

import { MeasurementCurveData } from '../types';

import { getSortingId } from './getSortingId';

export const sortCurvesToFill = (
  curves: MeasurementCurveData[]
): MeasurementCurveData[] => {
  const curvesWithSortingId = curves.map((curve) => {
    const { columnExternalId } = curve;

    return {
      ...curve,
      sortingId: getSortingId(columnExternalId),
    };
  });

  return sortObjectsAscending(curvesWithSortingId, 'sortingId');
};
