import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';
import { PlotMarker } from '../elements';
import { getMarkerPosition } from '../utils/getMarkerPosition';
import { getHoveredLineColor } from '../utils/getHoveredLineColor';

export interface HoverMarkerProps {
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor: string;
}

export const HoverMarker: React.FC<HoverMarkerProps> = ({
  plotHoverEvent,
  backgroundColor,
}) => {
  const { x, y } = getMarkerPosition(plotHoverEvent);

  return (
    <PlotMarker
      style={{
        top: y,
        left: x,
        backgroundColor: getHoveredLineColor(plotHoverEvent),
        visibility: plotHoverEvent ? 'visible' : 'hidden',
        border: `2px solid ${backgroundColor}`,
      }}
    />
  );
};
