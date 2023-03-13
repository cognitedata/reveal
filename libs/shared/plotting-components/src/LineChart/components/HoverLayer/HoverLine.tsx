import * as React from 'react';

import { Coordinate } from '../../types';
import { Line } from './elements';

export interface HoverLineProps {
  isVisible: boolean;
  position?: Coordinate;
  plotStyleData: Record<string, number>;
}

export const HoverLine: React.FC<HoverLineProps> = ({
  isVisible,
  position,
  plotStyleData,
}) => {
  const { offsetTop, height } = plotStyleData;

  return (
    <Line
      style={{
        left: position?.x,
        top: offsetTop,
        height: height + 1,
        opacity: isVisible ? 1 : 0,
        display: isVisible ? 'initial' : 'none',
      }}
    />
  );
};
