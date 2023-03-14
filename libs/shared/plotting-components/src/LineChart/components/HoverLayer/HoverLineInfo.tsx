import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import { Coordinate, HoverLineData } from '../../types';
import { getLineInfoPosition } from '../../utils/getLineInfoPosition';
import { LineInfo } from './elements';
import { getPointCustomData } from '../../utils/getPointCustomData';

export interface HoverLineInfoProps {
  chartRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  position?: Coordinate;
  plotStyleData: Record<string, number>;
  plotHoverEvent?: PlotHoverEvent;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLineInfo: React.FC<HoverLineInfoProps> = ({
  chartRef,
  isVisible,
  position,
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
    position?.x,
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
        customData: getPointCustomData(point),
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
        display: isVisible ? 'initial' : 'none',
      }}
      offset={lineInfoOffset}
    >
      {getLineInfoText()}
    </LineInfo>
  );
};
