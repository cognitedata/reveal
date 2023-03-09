import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';
import get from 'lodash/get';

import { Coordinate, HoverLineData } from '../../types';
import { getLineInfoPosition } from '../../utils/getLineInfoPosition';
import { LineInfo } from './elements';

export interface HoverLineInfoProps {
  chartRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  markerPosition: Coordinate;
  plotStyleData: Record<string, number>;
  plotHoverEvent?: PlotHoverEvent;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLineInfo: React.FC<HoverLineInfoProps> = ({
  chartRef,
  isVisible,
  markerPosition,
  plotStyleData,
  plotHoverEvent,
  formatHoverLineInfo,
}) => {
  const lineInfoRef = useRef<HTMLDivElement>(null);

  const [lineInfoWidth, setLineInfoWidth] = useState<number>();

  const updateLineInfoWidth = useCallback(() => {
    setLineInfoWidth(lineInfoRef.current?.clientWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotHoverEvent, lineInfoRef.current?.clientWidth]);

  useEffect(() => {
    updateLineInfoWidth();
  }, [updateLineInfoWidth]);

  const { offsetTop, height } = plotStyleData;
  const { lineInfoLeft, lineInfoOffset } = getLineInfoPosition(
    chartRef.current,
    markerPosition.x,
    lineInfoWidth
  );

  const point = head(plotHoverEvent?.points);

  const getLineInfoText = () => {
    if (!point) {
      return null;
    }

    if (formatHoverLineInfo) {
      return formatHoverLineInfo({
        x: point.x,
        y: point.y,
        name: point.data.name,
        customData: get(point.data, 'customData'),
      });
    }

    return String(point.x);
  };

  return (
    <LineInfo
      ref={lineInfoRef}
      style={{
        left: lineInfoLeft,
        top: offsetTop + height,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
      offset={lineInfoOffset}
    >
      {getLineInfoText()}
    </LineInfo>
  );
};
