import * as React from 'react';

import { DEPTH_SEGMENT_COLOR } from './constants';
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
  isLiner?: boolean;
}> = ({ height, isLiner }) => {
  return (
    <>
      {isLiner && <SideLine />}
      <DepthIndicatorLineWrapper height={height}>
        <DepthIndicatorLine
          color={DEPTH_SEGMENT_COLOR}
          data-testid="depth-indicator-line"
        />
      </DepthIndicatorLineWrapper>
    </>
  );
};

const End: React.FC = () => {
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
