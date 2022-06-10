import times from 'lodash/times';

import { TrueVerticalDepths } from '@cognite/sdk-wells-v3';

import { TrueVerticalDepthsDataLayer } from '../types';

export const normalizeTvd = (
  rawTvd: TrueVerticalDepths
): TrueVerticalDepthsDataLayer => {
  const { measuredDepths, trueVerticalDepths } = rawTvd;

  const mdTvdMap = times(measuredDepths.length).reduce(
    (valueMap, index) => ({
      ...valueMap,
      [measuredDepths[index]]: trueVerticalDepths[index],
    }),
    {} as TrueVerticalDepthsDataLayer['mdTvdMap']
  );

  return {
    ...rawTvd,
    mdTvdMap,
  };
};
