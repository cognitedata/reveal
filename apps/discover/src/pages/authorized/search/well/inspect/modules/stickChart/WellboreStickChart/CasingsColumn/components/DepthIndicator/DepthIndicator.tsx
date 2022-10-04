import React, { useCallback, useEffect, useRef, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import layers from 'utils/zindex';

import { Tooltip } from 'components/PopperTooltip';

import { CasingAssemblyView } from '../../../../types';

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
  depthTopScaled: number;
  depthBase: number;
  heightScaled: number;
  flip?: boolean;
  isOverlapping?: boolean;
}

/**
 * This component is used to generate depth indicator for a casing
 */
export const DepthIndicator: React.FC<DepthIndicatorProps> = ({
  casingAssembly,
  depthTopScaled,
  depthBase,
  heightScaled,
  flip = false,
  isOverlapping = false,
}) => {
  const depthIndicatorRef = useRef<HTMLElement>(null);

  const [zIndex, setZIndex] = useState<number>(layers.MAIN_LAYER);
  const [depthMarkerWidth, setDepthMarkerWidth] = useState<number>();

  const depthSegmentStartHeight = `${depthTopScaled}px`;
  const depthSegmentMiddleHeight = `calc(${heightScaled}px - ${DEPTH_INDICATOR_END_HEIGHT})`;

  const { isLiner, outsideDiameterFormatted } = casingAssembly;

  const tooltipContent = <TooltipContent {...casingAssembly} />;

  const DescriptionWrapper = flip ? DescriptionFlipped : DescriptionUnflipped;

  const updateDepthMarkerWidth = useCallback(
    () => setDepthMarkerWidth(depthIndicatorRef.current?.offsetLeft),
    [depthIndicatorRef.current?.offsetLeft]
  );

  useEffect(() => updateDepthMarkerWidth(), [updateDepthMarkerWidth]);

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
      onMouseEnter={() => setZIndex(layers.TOOLTIP_HOVERED)}
      onMouseLeave={() => setZIndex(layers.MAIN_LAYER)}
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
            isLiner={isLiner}
          />
          <DepthSegment.End />
        </FlipHorizontal>
      </Tooltip>

      {!isUndefined(depthMarkerWidth) && (
        <>
          <DepthScaleLabelTag
            left={depthMarkerWidth}
            $overlapping={isOverlapping}
          >
            {toFixedNumberFromNumber(depthBase, Fixed.NoDecimals)}
          </DepthScaleLabelTag>
          <DepthEndMarker width={depthMarkerWidth} />
        </>
      )}

      <DescriptionWrapper>{outsideDiameterFormatted}</DescriptionWrapper>
    </DepthIndicatorWrapper>
  );
};
