import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import { getMarkerPosition } from '../../utils/getMarkerPosition';
import { getHoveredLineColor } from '../../utils/getHoveredLineColor';

import { Marker, Line, HoverLayerWrapper, LineInfo } from './elements';
import {
  DEFAULT_BACKGROUND_COLOR,
  HOVER_MARKER_BORDER_WIDTH,
} from '../../constants';
import { getPlotStyleData } from '../../utils/getPlotStyleData';
import { HoverCursorInfoProps, Layout } from '../../types';

export interface HoverLayerProps {
  chartRef: React.RefObject<HTMLDivElement>;
  layout: Layout;
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor?: string;
  onHover?: () => void;
  onUnhover?: () => void;
  formatHoverLineText?: (props: HoverCursorInfoProps) => string;
}

export const HoverLayer: React.FC<HoverLayerProps> = ({
  chartRef,
  layout,
  plotHoverEvent,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  onHover,
  onUnhover,
  formatHoverLineText,
}) => {
  const { showHoverLine, showHoverLineText, showHoverMarker } = layout;

  const { x, y } = getMarkerPosition(plotHoverEvent);
  const { plotOffsetTop, gridHeight } = getPlotStyleData(chartRef.current);

  const point = head(plotHoverEvent?.points);

  const getLineInfoText = () => {
    if (!point) {
      return null;
    }

    if (formatHoverLineText) {
      return formatHoverLineText({
        x: point.x,
        y: point.y,
        name: point.data.name,
      });
    }

    return String(point.x);
  };

  const lineInfoText = getLineInfoText();
  const visibility = plotHoverEvent ? 'visible' : 'hidden';
  const opacity = plotHoverEvent ? 1 : 0;

  return (
    <HoverLayerWrapper
      style={{ visibility }}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      {showHoverLine && (
        <Line
          style={{
            left: x,
            top: plotOffsetTop,
            height: gridHeight,
            opacity,
          }}
        />
      )}

      {showHoverLine && showHoverLineText && (
        <LineInfo
          style={{
            left: x,
            top: plotOffsetTop + gridHeight,
            opacity,
          }}
        >
          {lineInfoText}
        </LineInfo>
      )}

      {showHoverMarker && (
        <Marker
          style={{
            top: y,
            left: x,
            opacity,
            backgroundColor: getHoveredLineColor(plotHoverEvent),
            border: `${HOVER_MARKER_BORDER_WIDTH}px solid ${backgroundColor}`,
          }}
        />
      )}
    </HoverLayerWrapper>
  );
};
