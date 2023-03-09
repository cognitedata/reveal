import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { HOVER_MARKER_BORDER_WIDTH } from '../../constants';
import { Coordinate } from '../../types';
import { getHoveredLineColor } from '../../utils/getHoveredLineColor';
import { Marker } from './elements';

export interface HoverMarkerProps {
  isVisible: boolean;
  markerPosition: Coordinate;
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor: string;
}

export const HoverMarker: React.FC<HoverMarkerProps> = ({
  isVisible,
  markerPosition,
  plotHoverEvent,
  backgroundColor,
}) => {
  return (
    <Marker
      style={{
        top: markerPosition.y,
        left: markerPosition.x,
        backgroundColor: getHoveredLineColor(plotHoverEvent),
        border: `${HOVER_MARKER_BORDER_WIDTH}px solid ${backgroundColor}`,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    />
  );
};
