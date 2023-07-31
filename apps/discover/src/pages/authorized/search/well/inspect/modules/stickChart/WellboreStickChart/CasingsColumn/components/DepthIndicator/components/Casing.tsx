import * as React from 'react';

import isUndefined from 'lodash/isUndefined';

import { Tooltip } from 'components/PopperTooltip';
import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView } from '../../../../../types';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../../constants';
import { DEPTH_INDICATOR_END_HEIGHT, TOOLTIP_PLACEMENT } from '../constants';
import { FlipHorizontal } from '../elements';

import { DepthSegment } from './DepthSegment';
import { TooltipContent } from './TooltipContent';

export interface CasingProps {
  casingAssembly: CasingAssemblyView;
  flip?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
  scaler: (value: number) => number;
}

export const Casing: React.FC<CasingProps> = ({
  casingAssembly,
  flip,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  scaler,
}) => {
  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const {
    isLiner,
    measuredDepthTop,
    measuredDepthBase,
    trueVerticalDepthTop,
    trueVerticalDepthBase,
  } = casingAssembly;

  const depthTop = isMdScale
    ? measuredDepthTop.value
    : trueVerticalDepthTop?.value;

  const depthBase = isMdScale
    ? measuredDepthBase.value
    : trueVerticalDepthBase?.value;

  if (isUndefined(depthTop) || isUndefined(depthBase)) {
    return null;
  }

  const depthTopScaled = scaler(depthTop);
  const heightScaled = scaler(depthBase - depthTop);

  const depthSegmentStartHeight = `${depthTopScaled}px`;
  const depthSegmentMiddleHeight = `calc(${heightScaled}px - ${DEPTH_INDICATOR_END_HEIGHT})`;

  const tooltipContent = <TooltipContent {...casingAssembly} />;

  return (
    <>
      <DepthSegment.Start height={depthSegmentStartHeight} />

      <Tooltip
        followCursor
        content={tooltipContent}
        placement={TOOLTIP_PLACEMENT}
      >
        <FlipHorizontal flip={flip}>
          <DepthSegment.Middle
            height={depthSegmentMiddleHeight}
            isLiner={isLiner}
          />
          <DepthSegment.End />
        </FlipHorizontal>
      </Tooltip>
    </>
  );
};
