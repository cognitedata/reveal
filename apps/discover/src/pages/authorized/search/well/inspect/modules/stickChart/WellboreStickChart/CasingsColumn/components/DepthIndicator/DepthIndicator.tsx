import React, { useCallback, useEffect, useRef, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import layers from 'utils/zindex';

import { Tooltip } from 'components/PopperTooltip';
import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView } from '../../../../types';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../constants';

import { DEPTH_INDICATOR_END_HEIGHT, TOOLTIP_PLACEMENT } from './constants';
import { DepthSegment } from './DepthSegment';
import {
  DepthEndMarkerForLine,
  DepthEndMarkerForTriangle,
  DepthIndicatorWrapper,
  DepthScaleLabelTag,
  DescriptionFlipped,
  DescriptionUnflipped,
  FlipHorizontal,
} from './elements';
import { TooltipContent } from './TooltipContent';

export interface DepthIndicatorProps {
  casingAssembly: CasingAssemblyView;
  casingStartDepthScaled: number;
  casingDepthScaled: number;
  // If the assembly is tied (connected) with another assembly.
  isTied: boolean;
  flip?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
  isOverlapping?: boolean;
}

/**
 * This component is used to generate depth indicator for a casing
 */
export const DepthIndicator: React.FC<DepthIndicatorProps> = ({
  casingAssembly,
  casingStartDepthScaled,
  casingDepthScaled,
  isTied,
  flip = false,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  isOverlapping = false,
}) => {
  const depthIndicatorRef = useRef<HTMLElement>(null);

  const [zIndex, setZIndex] = useState<number>(layers.MAIN_LAYER);
  const [depthMarkerWidth, setDepthMarkerWidth] = useState<number>();

  const depthSegmentStartHeight = `${casingStartDepthScaled}px`;
  const depthSegmentMiddleHeight = `calc(${casingDepthScaled}px - ${DEPTH_INDICATOR_END_HEIGHT})`;

  const {
    isLiner,
    outsideDiameterFormatted,
    measuredDepthBase,
    trueVerticalDepthBase,
  } = casingAssembly;

  const tooltipContent = <TooltipContent {...casingAssembly} />;

  const DescriptionWrapper = flip ? DescriptionFlipped : DescriptionUnflipped;

  const updateDepthMarkerWidth = useCallback(
    () => setDepthMarkerWidth(depthIndicatorRef.current?.offsetLeft),
    [depthIndicatorRef.current?.offsetLeft]
  );

  useEffect(() => updateDepthMarkerWidth(), [updateDepthMarkerWidth]);

  const isTvdBased = depthMeasurementType === DepthMeasurementUnit.TVD;

  const depthLabelValue = isTvdBased
    ? trueVerticalDepthBase?.value
    : measuredDepthBase.value;

  const DepthEndMarker = isLiner
    ? DepthEndMarkerForLine
    : DepthEndMarkerForTriangle;

  return (
    <DepthIndicatorWrapper
      ref={depthIndicatorRef}
      data-testid="depth-indicator"
      style={{ zIndex }}
      /**
       * A trick to prevent tooltip being overlapped.
       * This increases the zIndex of hovered depth indicator by one.
       * Then return it to the initial when the mouse left.
       */
      onMouseEnter={() => setZIndex((zIndex) => zIndex + 1)}
      onMouseLeave={() => setZIndex((zIndex) => zIndex - 1)}
    >
      <DepthSegment.Start height={depthSegmentStartHeight} />
      <Tooltip
        followCursor
        content={tooltipContent}
        placement={TOOLTIP_PLACEMENT}
      >
        <FlipHorizontal flip={flip}>
          <DepthSegment.Middle
            height={depthSegmentMiddleHeight}
            isTied={isTied}
          />
          <DepthSegment.End isLiner={isLiner} />
        </FlipHorizontal>
      </Tooltip>

      {!isUndefined(depthMarkerWidth) && !isUndefined(depthLabelValue) && (
        <>
          <DepthScaleLabelTag
            left={depthMarkerWidth}
            $overlapping={isOverlapping}
          >
            {toFixedNumberFromNumber(Number(depthLabelValue), Fixed.NoDecimals)}
          </DepthScaleLabelTag>
          <DepthEndMarker width={depthMarkerWidth} />
        </>
      )}

      <DescriptionWrapper>{outsideDiameterFormatted}</DescriptionWrapper>
    </DepthIndicatorWrapper>
  );
};
