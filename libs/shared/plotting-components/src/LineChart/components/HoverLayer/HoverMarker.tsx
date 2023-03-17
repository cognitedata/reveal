import * as React from 'react';

import { Coordinate, Variant } from '../../types';
import { LineMarker } from './elements';

export interface HoverMarkerProps {
  isVisible: boolean;
  position?: Coordinate;
  variant?: Variant;
  markerColor: string;
  borderColor: string;
}

export const HoverMarker: React.FC<HoverMarkerProps> = ({
  isVisible,
  position,
  variant,
  markerColor,
  borderColor,
}) => {
  const scale = variant === 'small' ? 0.5 : 1;

  return (
    <LineMarker
      style={{
        left: position?.x,
        top: position?.y,
        backgroundColor: markerColor,
        outlineColor: borderColor,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: isVisible ? 1 : 0,
        display: isVisible ? 'initial' : 'none',
      }}
    />
  );
};
