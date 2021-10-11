import React, { FC } from 'react';

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
}: Props) => {
  const startHeight = `${startDepth}%`;
  const middleHeight = `calc(${casingDepth}% - ${triangleHeight}px)`;
  const indicatorTransform = `rotateY(${flip ? '180' : '0'}deg)`;
  const [zIndex, setRecentZIndex] = React.useState(0);

  const onIndicatorClick = () => {
    if (onClick) {
      // This returns last zindex value in casing view
      const recentZIndex = onClick();
      setRecentZIndex(recentZIndex);
    }
  };

  return (
    <DepthIndicatorWrapper transform={indicatorTransform} zIndex={zIndex}>
      <Start height={startHeight} onClick={onIndicatorClick} />
      <Middle onClick={onIndicatorClick} height={middleHeight} />
      <End onClick={onIndicatorClick}>
        {linerCasing ? <LinerEnd /> : <TriangleBottomRight />}
      </End>
      {description && (
        <Description linerCasing={linerCasing} onClick={onIndicatorClick}>
          {description}
        </Description>
      )}
    </DepthIndicatorWrapper>
  );
};

export default DepthIndicator;
