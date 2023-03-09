import * as React from 'react';

import { Coordinate } from '../../types';
import { Line } from './elements';

export interface HoverLineProps {
  isVisible: boolean;
  markerPosition: Coordinate;
  plotStyleData: Record<string, number>;
}

export const HoverLine: React.FC<HoverLineProps> = ({
  isVisible,
  markerPosition,
  plotStyleData,
}) => {
  const { offsetTop, height } = plotStyleData;

  return (
    <Line
      style={{
        left: markerPosition.x,
        top: offsetTop,
        height: height + 1,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    />
  );
};
