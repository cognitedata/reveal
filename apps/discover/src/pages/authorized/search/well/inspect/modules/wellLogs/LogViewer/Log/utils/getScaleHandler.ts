import compact from 'lodash/compact';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';
import {
  InterpolatedScaleHandler,
  ScaleHandler,
  ScaleInterpolator,
} from '@cognite/videx-wellog';

import { Domain, WellLogPreviewData, Tuplet } from '../types';

export const getScaleHandler = ({
  logData,
  domain,
  depthIndexType,
}: {
  logData: WellLogPreviewData;
  domain: Domain;
  depthIndexType: DepthIndexTypeEnum;
}) => {
  const defaultScaleHandler = getDefaultScaleHandler(domain);

  const mdColumnData = Object.values(logData).find(
    (data) => data.measurementType === DepthIndexTypeEnum.MeasuredDepth
  );
  const tvdColumnData = Object.values(logData).find(
    (data) => data.measurementType === DepthIndexTypeEnum.TrueVerticalDepth
  );

  if (!mdColumnData || !tvdColumnData) {
    return defaultScaleHandler;
  }

  const tuplets = (
    depthIndexType === DepthIndexTypeEnum.MeasuredDepth
      ? tvdColumnData.values
      : mdColumnData.values
  ) as Tuplet[];

  const forwardValues = compact(tuplets.map((tuplet) => tuplet[0]));
  const reverseValues = compact(tuplets.map((tuplet) => tuplet[1]));

  if (isEmpty(forwardValues) || isEmpty(reverseValues)) {
    return defaultScaleHandler;
  }

  const forwardValueMapping: Record<number, number> = {};
  const reverseValueMapping: Record<number, number> = {};

  tuplets.forEach((tuplet) => {
    const [forwardValue, reverseValue] = tuplet;

    if (!isNil(forwardValue) && !isNil(reverseValue)) {
      forwardValueMapping[forwardValue] = reverseValue;
      reverseValueMapping[reverseValue] = forwardValue;
    }
  });

  const forward = (value: number) => {
    const closestValue = getClosestValue(forwardValues, value);
    return forwardValueMapping[closestValue];
  };
  const reverse = (value: number) => {
    const closestValue = getClosestValue(reverseValues, value);
    return reverseValueMapping[closestValue];
  };

  const interpolator: ScaleInterpolator = {
    forward,
    reverse,
    forwardInterpolatedDomain: (domain) => domain.map(forward),
    reverseInterpolatedDomain: (domain) => domain.map(reverse),
  };

  const scaleHandler = new InterpolatedScaleHandler(interpolator, domain).range(
    domain
  );

  return scaleHandler;
};

export const getClosestValue = (values: number[], targetValue: number) => {
  return values.reduce((previousValue, currentValue) => {
    return Math.abs(currentValue - targetValue) <
      Math.abs(previousValue - targetValue)
      ? currentValue
      : previousValue;
  }, head(values) || 0);
};

/**
 * Should return a scale handler which doesn't have any changes in scale mapping.
 * Both `forward` and `reverse` should return the same value which is passed into.
 *
 * ie: `0` should be mapped to `0` itself. `10` should be mapped to `10` itself.
 */
export const getDefaultScaleHandler = (domain: Domain): ScaleHandler => {
  const forward = (value: number) => value;
  const reverse = (value: number) => value;

  const interpolator: ScaleInterpolator = {
    forward,
    reverse,
    forwardInterpolatedDomain: (domain) => domain.map(forward),
    reverseInterpolatedDomain: (domain) => domain.map(reverse),
  };

  return new InterpolatedScaleHandler(interpolator, domain).range(domain);
};
