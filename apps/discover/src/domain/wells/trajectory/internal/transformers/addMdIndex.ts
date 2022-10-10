import times from 'lodash/times';

import { TrueVerticalDepths } from '@cognite/sdk-wells';

import { TvdDataWithMdIndex } from '../types';

export const addMdIndex = (rawTvd: TrueVerticalDepths): TvdDataWithMdIndex => {
  const { measuredDepths, trueVerticalDepths } = rawTvd;

  const mdTvdMap = times(measuredDepths.length).reduce(
    (valueMap, index) => ({
      ...valueMap,
      [measuredDepths[index]]: trueVerticalDepths[index],
    }),
    {} as TvdDataWithMdIndex['mdTvdMap']
  );

  return {
    ...rawTvd,
    mdTvdMap,
  };
};
