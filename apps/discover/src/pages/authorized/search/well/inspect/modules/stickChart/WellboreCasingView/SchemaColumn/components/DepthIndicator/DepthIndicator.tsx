import React, { useCallback, useEffect, useRef, useState } from 'react';

import layers from 'utils/zindex';

import { Tooltip } from 'components/PopperTooltip';

import { CasingAssemblyView } from '../../../../types';

import { DEPTH_INDICATOR_END_HEIGHT, TOOLTIP_PLACEMENT } from './constants';
import { DepthSegment } from './DepthSegment';
import {
  DepthEndMarkerForLine,
  DepthEndMarkerForTriangle,
  DepthIndicatorWrapper,
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
}) => {
  const depthIndicatorRef = useRef<HTMLElement>(null);

  const [zIndex, setZIndex] = useState<number>(layers.MAIN_LAYER);
  const [depthMarkerWidth, setDepthMarkerWidth] = useState<number>();

  const depthSegmentStartHeight = `${casingStartDepthScaled}px`;
  const depthSegmentMiddleHeight = `calc(${casingDepthScaled}px - ${DEPTH_INDICATOR_END_HEIGHT})`;

  const { isLiner, outsideDiameterFormatted } = casingAssembly;

  const tooltipContent = <TooltipContent {...casingAssembly} />;

  const DescriptionWrapper = flip ? DescriptionFlipped : DescriptionUnflipped;

  const updateDepthMarkerWidth = useCallback(
    () => setDepthMarkerWidth(depthIndicatorRef.current?.offsetLeft),
    [depthIndicatorRef.current?.offsetLeft]
  );

  useEffect(() => updateDepthMarkerWidth(), [updateDepthMarkerWidth]);

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

      {isLiner ? (
        <DepthEndMarkerForLine width={depthMarkerWidth} />
      ) : (
        <DepthEndMarkerForTriangle width={depthMarkerWidth} />
      )}

      <DescriptionWrapper>{outsideDiameterFormatted}</DescriptionWrapper>
    </DepthIndicatorWrapper>
  );
};
