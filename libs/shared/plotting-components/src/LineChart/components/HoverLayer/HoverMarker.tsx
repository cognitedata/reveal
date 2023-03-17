import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { Coordinate, Variant } from '../../types';
import { LineMarker } from './elements';
import { getMarkerPosition } from '../../utils/getMarkerPosition';
import { getHoveredLineColor } from '../../utils/getHoveredLineColor';

export interface HoverMarkerProps {
  isVisible: boolean;
  position?: Coordinate;
  variant?: Variant;
  plotHoverEvent?: PlotHoverEvent;
  borderColor: string;
}

export const HoverMarker: React.FC<HoverMarkerProps> = ({
  isVisible,
  position,
  variant,
  plotHoverEvent,
  borderColor,
}) => {
  if (!plotHoverEvent) {
    return null;
  }

  const markerPosition = getMarkerPosition(plotHoverEvent);
  const color = getHoveredLineColor(plotHoverEvent);
  const scale = variant === 'small' ? 0.5 : 1;

  return (
    <LineMarker
      style={{
        left: position?.x,
        top: markerPosition?.y,
        backgroundColor: color,
        outlineColor: borderColor,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: isVisible ? 1 : 0,
        display: isVisible ? 'initial' : 'none',
      }}
    />
  );
};
