import {
  CurveSuffix,
  DepthMeasurementDataColumnInternal,
} from 'domain/wells/measurements/internal/types';
import { getDifferentiableIdPrefixes } from 'domain/wells/measurements/internal/utils/getDifferentiableIdPrefixes';
import { withSuffix } from 'domain/wells/measurements/internal/utils/handleId';

import keyBy from 'lodash/keyBy';
import map from 'lodash/map';

export const getDifferentiableColumns = (
  columns: DepthMeasurementDataColumnInternal[]
) => {
  const columnIds = map(columns, 'externalId');
  const keyedColumns = keyBy(columns, 'externalId');

  return getDifferentiableIdPrefixes(columnIds).map((idPrefix) => {
    return {
      ...keyedColumns[withSuffix(idPrefix, CurveSuffix.LOW)],
      externalId: withSuffix(idPrefix, CurveSuffix.DIFF),
    };
  });
};
