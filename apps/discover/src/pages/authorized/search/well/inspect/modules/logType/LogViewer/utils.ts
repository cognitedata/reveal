import head from 'lodash/head';
import isNil from 'lodash/isNil';

import { Sequence } from '@cognite/sdk';
import { InterpolatedScaleHandler } from '@cognite/videx-wellog';

import { LogData, Tuplet } from './Log/interfaces';

/**
 *
 * This returns closest value for a given value in a given value list.
 */
export const getClosestValue = (valueList: number[], goal: number) => {
  return valueList.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

// This returns logviewer scale handler and the domain
export const getScaleHandler = (logData: LogData) => {
  if (!logData.MD || !logData.MD.values)
    return { scaleHandler: null, domain: [] };

  const mdValueList = logData.MD.values as number[];

  // Find domain from start depth and end depth
  const domain: number[] = [
    head(mdValueList) || 0, // start depth
    mdValueList[mdValueList.length - 1], // end depth
  ];

  let scaleHandler = null;

  if (logData.TVD && logData.TVD.values) {
    const tvdTupletList = logData.TVD.values as Tuplet[];
    const tvdValueList = tvdTupletList.map((row: Tuplet) => row[1]);
    const forwardTVDValueMapping: { [key: number]: number } = {};
    const reverseTVDValueMapping: { [key: number]: number } = {};

    tvdTupletList.forEach((tvdRow: Tuplet) => {
      const [mdValue, tvdValue] = tvdRow;

      // Set MD values as mapping against TVD value
      if (!isNil(tvdValue)) {
        forwardTVDValueMapping[tvdValue] = mdValue;
      }

      // Set TVD values as mapping against MD value
      if (!isNil(mdValue)) {
        reverseTVDValueMapping[mdValue] = tvdValue;
      }
    });

    const forward = (v: number) => {
      const closestValue = getClosestValue(tvdValueList, v);
      return forwardTVDValueMapping[closestValue];
    };
    const reverse = (v: number) => {
      const closestValue = getClosestValue(mdValueList, v);
      return reverseTVDValueMapping[closestValue];
    };
    const interpolator = {
      forward,
      reverse,
      forwardInterpolatedDomain: (d: number[]) => {
        return d.map((v: number) => forward(v));
      },
      reverseInterpolatedDomain: (d: number[]) => {
        return d.map((v: number) => reverse(v));
      },
    };
    scaleHandler = new InterpolatedScaleHandler(interpolator, domain).range(
      domain
    );
  }

  return { scaleHandler, domain };
};

// This returns the depth unit and set in the state
export const getTrackUnit = (log: Sequence, track: string) => {
  const units = log.columns
    .filter((column) => column.name === track)
    .map((column) => column.metadata?.unit);
  return head(units) || '';
};

export const sortTuples = (values: Tuplet[]) => {
  return values.sort((a, b) => {
    const firstA = head(a);
    const firstB = head(b);
    if (!firstA) return -1;
    if (!firstB) return -1;
    return firstA - firstB;
  });
};
