import React from 'react';

import {
  DEPTH_INDICATOR_END_HEIGHT,
  SEGMENT_COLOR,
  START_SEGMENT_COLOR,
} from './constants';
import {
  DepthIndicatorLine,
  DepthIndicatorLineWrapper,
  TriangleBottomLeft,
  TriangleBottomRight,
} from './elements';

const Start: React.FC<{
  height: string;
}> = ({ height }) => {
  return (
    <DepthIndicatorLineWrapper height={height}>
      <DepthIndicatorLine color={START_SEGMENT_COLOR} />
    </DepthIndicatorLineWrapper>
  );
};

const Middle: React.FC<{
  height: string;
}> = ({ height }) => {
  return (
    <DepthIndicatorLineWrapper height={height}>
      <DepthIndicatorLine color={SEGMENT_COLOR} />
    </DepthIndicatorLineWrapper>
  );
};

const End: React.FC<{
  linerCasing?: boolean;
  leftEnd?: boolean;
}> = ({ linerCasing, leftEnd }) => {
  if (linerCasing) {
    return (
      <DepthIndicatorLineWrapper height={DEPTH_INDICATOR_END_HEIGHT}>
        <DepthIndicatorLine color={SEGMENT_COLOR} />
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
