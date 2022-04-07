import React, { FC } from 'react';

import { Tooltip } from 'components/popper-tooltip';

import {
  DepthIndicatorWrapper,
  LinerEnd,
  TriangleBottomRight,
  Description,
  Start,
  End,
  Middle,
} from './elements';

type Props = {
  startDepth?: number;
  casingDepth: number;
  flip?: boolean;
  description?: string;
  onClick?: () => number;
  linerCasing: boolean;
  outerDiameter: string;
};

const triangleHeight = 16;

/**
 * This component is used to generate depth indicator for a casing
 * @param param0
 */
const DepthIndicator: FC<Props> = ({
  startDepth = 0,
  casingDepth,
  flip = false,
  description,
  onClick,
  linerCasing = false,
  outerDiameter,
}: Props) => {
  const startHeight = `${startDepth}%`;
  const middleHeight = `calc(${casingDepth}% - ${triangleHeight}px)`;
  const indicatorTransform = flip ? `rotateY(180deg)` : undefined;
  const [zIndex, setRecentZIndex] = React.useState(0);

  const onMouseOver = () => {
    if (onClick) {
      // This returns last zindex value in casing view
      const recentZIndex = onClick();
      setRecentZIndex(recentZIndex);
    }
  };

  return (
    <DepthIndicatorWrapper
      transform={indicatorTransform}
      zIndex={zIndex}
      data-testid="depth-indicator"
    >
      <Tooltip content={description} followCursor>
        <Start height={startHeight} onMouseOver={onMouseOver} />
      </Tooltip>
      <Tooltip content={description} followCursor>
        <Middle onClick={onMouseOver} height={middleHeight} />
      </Tooltip>
      <Tooltip content={description} followCursor>
        <End onMouseOver={onMouseOver}>
          {linerCasing ? <LinerEnd /> : <TriangleBottomRight />}
        </End>
      </Tooltip>
      {outerDiameter && (
        <Description linerCasing={linerCasing} onMouseOver={onMouseOver}>
          {outerDiameter}
        </Description>
      )}
    </DepthIndicatorWrapper>
  );
};

export default DepthIndicator;
