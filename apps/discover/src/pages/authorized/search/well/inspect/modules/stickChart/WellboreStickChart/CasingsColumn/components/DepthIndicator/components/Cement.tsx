import { CasingCementingInternalWithTvd } from 'domain/wells/casings/internal/types';

import * as React from 'react';

import isUndefined from 'lodash/isUndefined';

import { DepthMeasurementUnit } from 'constants/units';

import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../../constants';
import { CementIndicator } from '../elements';

export interface CementProps {
  cementing?: CasingCementingInternalWithTvd;
  depthMeasurementType?: DepthMeasurementUnit;
  scaler: (value: number) => number;
}

export const Cement: React.FC<CementProps> = ({
  cementing,
  scaler,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
}) => {
  if (!cementing) {
    return null;
  }

  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const {
    topMeasuredDepth,
    baseMeasuredDepth,
    topTrueVerticalDepth,
    baseTrueVerticalDepth,
  } = cementing;

  const depthTop = isMdScale
    ? topMeasuredDepth?.value
    : topTrueVerticalDepth?.value;

  const depthBase = isMdScale
    ? baseMeasuredDepth?.value
    : baseTrueVerticalDepth?.value;

  if (isUndefined(depthTop) || isUndefined(depthBase)) {
    return null;
  }

  const depthTopScaled = scaler(depthTop);
  const heightScaled = scaler(depthBase - depthTop);

  return <CementIndicator top={depthTopScaled} height={heightScaled} />;
};
