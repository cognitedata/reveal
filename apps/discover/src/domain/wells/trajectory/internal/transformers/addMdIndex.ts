import times from 'lodash/times';

import { TrueVerticalDepths } from '@cognite/sdk-wells';

import { TvdDataWithMdIndex } from '../types';

export const addMdIndex = (rawTvd: TrueVerticalDepths): TvdDataWithMdIndex => {
  const { measuredDepths, trueVerticalDepths } = rawTvd;

  /**
   * Don't use `reduce` here.
   * There can be an extreme edge case that,
   * interpolation response has so many elements (such as 40k+ elements).
   *
   * Returning a new object in each iteration exceeds the maximum call stack size.
   * This causes the browser to freeze.
   * Ref: PP-3341
   */

  const mdTvdMap = new Map<number, number>();

  times(measuredDepths.length).forEach((index) => {
    mdTvdMap.set(measuredDepths[index], trueVerticalDepths[index]);
  });

  return {
    ...rawTvd,
    mdTvdMap: Object.fromEntries(mdTvdMap),
  };
};
