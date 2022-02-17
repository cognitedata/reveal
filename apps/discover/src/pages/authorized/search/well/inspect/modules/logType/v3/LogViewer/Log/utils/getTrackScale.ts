import compact from 'lodash/compact';
import isNil from 'lodash/isNil';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells-v3';
import {
  InterpolatedScaleHandler,
  ScaleInterpolator,
} from '@cognite/videx-wellog';
import { Domain } from '@cognite/videx-wellog/dist/common/interfaces';

import { LogData, Tuplet } from '../interfaces';

export const getTrackScale = ({
  logData,
  depthIndexType,
  depthIndexColumnExternalId,
}: {
  logData: LogData;
  depthIndexColumnExternalId: string;
  depthIndexType: DepthIndexTypeEnum;
}) => {
  const { domain } = logData[depthIndexColumnExternalId];

  const mdColumnData = Object.values(logData).find(
    (data) => data.measurementType === DepthIndexTypeEnum.MeasuredDepth
  );
  const tvdColumnData = Object.values(logData).find(
    (data) => data.measurementType === DepthIndexTypeEnum.TrueVerticalDepth
  );

  if (!mdColumnData || !tvdColumnData) {
    return {
      scaleHandler: getDefaultScaleHandler(domain),
      domain,
    };
  }

  const tuplets = (
    depthIndexType === DepthIndexTypeEnum.MeasuredDepth
      ? tvdColumnData.values
      : mdColumnData.values
  ) as Tuplet[];

  const forwardValues = compact(tuplets.map((tuplet) => tuplet[0]));
  const reverseValues = compact(tuplets.map((tuplet) => tuplet[1]));

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

  return { scaleHandler, domain };
};

export const getClosestValue = (values: number[], targetValue: number) => {
  return values.reduce((previousValue, currentValue) => {
    return Math.abs(currentValue - targetValue) <
      Math.abs(previousValue - targetValue)
      ? currentValue
      : previousValue;
  }, 0);
};

export const getDefaultScaleHandler = (domain: Domain) => {
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
