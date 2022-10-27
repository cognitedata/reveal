import * as React from 'react';

import { CasingDepthTagLabel, DepthEndMarker } from './elements';

export interface CasingDepthTagProps {
  content: number | string;
  depthMarkerWidth: number;
  isOverlapping: boolean;
}

export const CasingDepthTag: React.FC<CasingDepthTagProps> = ({
  content,
  depthMarkerWidth,
  isOverlapping,
}) => {
  return (
    <>
      <CasingDepthTagLabel left={depthMarkerWidth} $overlapping={isOverlapping}>
        {content}
      </CasingDepthTagLabel>
      <DepthEndMarker width={depthMarkerWidth} />
    </>
  );
};
