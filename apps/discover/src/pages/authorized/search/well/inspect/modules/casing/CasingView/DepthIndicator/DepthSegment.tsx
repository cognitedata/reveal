import React from 'react';

import { DEPTH_INDICATOR_END_HEIGHT, DEPTH_SEGMENT_COLOR } from './constants';
import {
  DepthIndicatorLine,
  DepthIndicatorLineWrapper,
  SideLineLeft,
  SideLineRight,
  TriangleBottomLeft,
  TriangleBottomRight,
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
  leftEnd?: boolean;
}> = ({ height, isTied, leftEnd }) => {
  return (
    <>
      {isTied && (leftEnd ? <SideLineLeft /> : <SideLineRight />)}
      <DepthIndicatorLineWrapper height={height}>
        <DepthIndicatorLine color={DEPTH_SEGMENT_COLOR} />
      </DepthIndicatorLineWrapper>
    </>
  );
};

const End: React.FC<{
  liner?: boolean;
  leftEnd?: boolean;
}> = ({ liner, leftEnd }) => {
  if (liner) {
    return (
      <DepthIndicatorLineWrapper height={DEPTH_INDICATOR_END_HEIGHT}>
        <DepthIndicatorLine color={DEPTH_SEGMENT_COLOR} />
      </DepthIndicatorLineWrapper>
    );
  }

  return (
    <DepthIndicatorLineWrapper>
      {leftEnd ? <TriangleBottomLeft /> : <TriangleBottomRight />}
    </DepthIndicatorLineWrapper>
  );
};

export const DepthSegment = {
  Start,
  Middle,
  End,
};
