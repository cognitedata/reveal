import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

import uniqBy from 'lodash/uniqBy';

import { CurvesFilterType, MeasurementsView } from '../types';

import { getDifferentiableColumns } from './getDifferentiableColumns';

const MEASUREMENT_TYPE_CURVE_FILTER_MAP: Partial<
  Record<MeasurementTypeParent, CurvesFilterType>
> = {
  [MeasurementTypeParent.GEOMECHANNICS]: CurvesFilterType.GEOMECHANNICS,
  [MeasurementTypeParent.PPFG]: CurvesFilterType.PPFG,
};

const initialCurveFilterOptions = Object.values(CurvesFilterType).reduce(
  (optionsMap, filterType) => ({
    ...optionsMap,
    [filterType]: [],
  }),
  {} as Record<CurvesFilterType, string[]>
);

export const getCurveFilterOptions = (data: MeasurementsView[]) => {
  const allColumns = data.flatMap(({ columns }) => columns);
  const uniqueColumns = uniqBy(allColumns, 'externalId');
  const differentiableColumns = getDifferentiableColumns(uniqueColumns);

  return [...uniqueColumns, ...differentiableColumns].reduce(
    (optionsMap, { externalId, measurementTypeParent }) => {
      if (!measurementTypeParent) {
        return optionsMap;
      }

      const filterType =
        MEASUREMENT_TYPE_CURVE_FILTER_MAP[measurementTypeParent] ||
        CurvesFilterType.OTHER;

      return {
        ...optionsMap,
        [filterType]: [...optionsMap[filterType], externalId],
      };
    },
    initialCurveFilterOptions
  );
};
