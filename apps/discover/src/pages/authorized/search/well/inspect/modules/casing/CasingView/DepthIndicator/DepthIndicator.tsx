import React, { FC } from 'react';

import { Tooltip } from 'components/popper-tooltip';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';
import { PreviewCasingType } from 'modules/wellSearch/types';

import {
  DepthIndicatorWrapper,
  LinerEnd,
  TriangleBottomRight,
  Description,
  Start,
  End,
  Middle,
} from './elements';
import { TooltipContent } from './TooltipContent';

type DepthIndicatorProps = {
  normalizedCasing: PreviewCasingType;
  flip?: boolean;
};

const triangleHeight = 16;

/**
 * This component is used to generate depth indicator for a casing
 * @param param0
 */
const DepthIndicator: FC<DepthIndicatorProps> = ({
  normalizedCasing,
  flip = false,
}) => {
  const enableWellSdkV3 = useEnabledWellSdkV3();

  const {
    startDepth = 0,
    endDepth,
    startDepthTVD,
    endDepthTVD,
    depthUnit,
    casingDepth,
    casingDescription,
    outerDiameter,
    linerCasing = false,
  } = normalizedCasing;

  const startHeight = `${startDepth}%`;
  const middleHeight = `calc(${casingDepth}% - ${triangleHeight}px)`;
  const indicatorTransform = flip ? `rotateY(180deg)` : undefined;

  const tooltipContent = enableWellSdkV3 ? (
    <TooltipContent
      assemblyType={linerCasing ? 'Liner' : 'Casing'}
      topDepthMD={startDepth.toFixed(2)}
      bottomDepthMD={endDepth}
      topDepthTVD={startDepthTVD && startDepthTVD.toFixed(2)}
      bottomDepthTVD={endDepthTVD && endDepthTVD.toFixed(2)}
      depthUnit={depthUnit}
    />
  ) : (
    casingDescription
  );
  const tooltipPlacement = enableWellSdkV3 ? 'left' : 'top';

  return (
    <DepthIndicatorWrapper
      transform={indicatorTransform}
      data-testid="depth-indicator"
    >
      <Tooltip
        followCursor
        content={tooltipContent}
        placement={tooltipPlacement}
      >
        <Start height={startHeight} />
      </Tooltip>

      <Tooltip
        followCursor
        content={tooltipContent}
        placement={tooltipPlacement}
      >
        <Middle height={middleHeight} />
      </Tooltip>

      <Tooltip
        followCursor
        content={tooltipContent}
        placement={tooltipPlacement}
      >
        <End>{linerCasing ? <LinerEnd /> : <TriangleBottomRight />}</End>
      </Tooltip>

      {outerDiameter && (
        <Description linerCasing={linerCasing}>{outerDiameter}</Description>
      )}
    </DepthIndicatorWrapper>
  );
};

export default DepthIndicator;
