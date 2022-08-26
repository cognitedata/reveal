import * as React from 'react';

import { DEPTH_INDICATOR_END_HEIGHT, DEPTH_SEGMENT_COLOR } from './constants';
import {
  DepthIndicatorLine,
  DepthIndicatorLineWrapper,
  SideLine,
  TriangleBottom,
} from './elements';

const Start: React.FC<{
  height: string;
}> = ({ height }) => {
  return (
    <DepthIndicatorLineWrapper height={height} disablePointer>
      <DepthIndicatorLine />
    </DepthIndicatorLineWrapper>
  );
};

const Middle: React.FC<{
  height: string;
  isTied?: boolean;
}> = ({ height, isTied }) => {
  return (
    <>
      {isTied && <SideLine />}
      <DepthIndicatorLineWrapper height={height}>
        <DepthIndicatorLine
          color={DEPTH_SEGMENT_COLOR}
          data-testid="depth-indicator-line"
        />
      </DepthIndicatorLineWrapper>
    </>
  );
};

const End: React.FC<{
  isLiner?: boolean;
}> = ({ isLiner }) => {
  if (isLiner) {
    return (
      <DepthIndicatorLineWrapper height={DEPTH_INDICATOR_END_HEIGHT}>
        <DepthIndicatorLine color={DEPTH_SEGMENT_COLOR} />
      </DepthIndicatorLineWrapper>
    );
  }

  return (
    <DepthIndicatorLineWrapper>
      <TriangleBottom />
    </DepthIndicatorLineWrapper>
  );
};

export const DepthSegment = {
  Start,
  Middle,
  End,
};
