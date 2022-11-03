import * as React from 'react';

import { DepthLimitMarker, DepthLimitTagLabel } from './elements';

export interface DepthLimitTagProps {
  content: number | string;
  scaledDepth?: number;
}

export const DepthLimitTag: React.FC<DepthLimitTagProps> = ({
  content,
  scaledDepth = 0,
}) => {
  return (
    <>
      <DepthLimitTagLabel top={scaledDepth}>{content}</DepthLimitTagLabel>
      <DepthLimitMarker />
    </>
  );
};
