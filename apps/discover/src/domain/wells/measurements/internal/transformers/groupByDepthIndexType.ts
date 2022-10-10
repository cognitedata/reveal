import groupBy from 'lodash/groupBy';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { EMPTY_ARRAY } from 'constants/empty';

import { DepthIndexColumnInternal } from '../types';

export const groupByDepthIndexType = <
  T extends { depthColumn: DepthIndexColumnInternal }
>(
  data: T[]
): Record<DepthIndexTypeEnum, T[]> => {
  const groupedData = groupBy(data, 'depthColumn.type');

  const md = groupedData[DepthIndexTypeEnum.MeasuredDepth];
  const tvd = groupedData[DepthIndexTypeEnum.TrueVerticalDepth];

  return {
    [DepthIndexTypeEnum.MeasuredDepth]: md || (EMPTY_ARRAY as T[]),
    [DepthIndexTypeEnum.TrueVerticalDepth]: tvd || (EMPTY_ARRAY as T[]),
  } as Record<DepthIndexTypeEnum, T[]>;
};
