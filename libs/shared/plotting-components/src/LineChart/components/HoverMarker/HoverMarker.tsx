import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { getMarkerPosition } from '../../utils/getMarkerPosition';
import { getHoveredLineColor } from '../../utils/getHoveredLineColor';

import { PlotMarker } from './elements';
import { HOVER_MARKER_BORDER_WIDTH } from '../../constants';

export interface HoverMarkerProps {
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor: string;
  onHover?: () => void;
  onUnhover?: () => void;
}

export const HoverMarker: React.FC<HoverMarkerProps> = ({
  plotHoverEvent,
  backgroundColor,
  onHover,
  onUnhover,
}) => {
  const { x, y } = getMarkerPosition(plotHoverEvent);

  return (
    <PlotMarker
      style={{
        top: y,
        left: x,
        backgroundColor: getHoveredLineColor(plotHoverEvent),
        visibility: plotHoverEvent ? 'visible' : 'hidden',
        border: `${HOVER_MARKER_BORDER_WIDTH}px solid ${backgroundColor}`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    />
  );
};
