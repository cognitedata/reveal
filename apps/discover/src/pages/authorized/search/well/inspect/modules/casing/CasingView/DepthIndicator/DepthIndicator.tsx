import React, { useState } from 'react';

import layers from 'utils/zindex';

import { Tooltip } from 'components/PopperTooltip';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';
import { PreviewCasingType } from 'modules/wellSearch/types';

import { DEPTH_INDICATOR_END_HEIGHT, TOOLTIP_PLACEMENT } from './constants';
import { DepthSegment } from './DepthSegment';
import { DepthIndicatorWrapper, Description } from './elements';
import { TooltipContent } from './TooltipContent';

export interface DepthIndicatorProps {
  normalizedCasing: PreviewCasingType;
  // If the assembly is tied (connected) with another assembly.
  isTied: boolean;
}

/**
 * This component is used to generate depth indicator for a casing
 */
const DepthIndicator: React.FC<DepthIndicatorProps> = ({
  normalizedCasing,
  isTied,
}) => {
  const enableWellSdkV3 = useEnabledWellSdkV3();

  const [zIndex, setZIndex] = useState<number>(layers.MAIN_LAYER);

  const {
    casingStartDepth = 0,
    casingDepth,
    casingDescription,
    outerDiameter,
    liner = false,
    leftEnd,
  } = normalizedCasing;

  const startHeight = `${casingStartDepth}%`;
  const middleHeight = `calc(${casingDepth}% - ${DEPTH_INDICATOR_END_HEIGHT})`;

  const tooltipContent = enableWellSdkV3 ? (
    <TooltipContent {...normalizedCasing} />
  ) : (
    casingDescription
  );

  return (
    <DepthIndicatorWrapper
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
      <DepthSegment.Start height={startHeight} />
      <Tooltip
        followCursor
        content={tooltipContent}
        placement={TOOLTIP_PLACEMENT}
      >
        <DepthSegment.Middle
          height={middleHeight}
          isTied={isTied}
          leftEnd={leftEnd}
        />
        <DepthSegment.End liner={liner} leftEnd={leftEnd} />
      </Tooltip>

      {outerDiameter && (
        <Description leftEnd={leftEnd}>{outerDiameter}</Description>
      )}
    </DepthIndicatorWrapper>
  );
};

export default DepthIndicator;
