import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import isUndefined from 'lodash/isUndefined';
import { Coordinate, HoverLineData } from '../../types';
import { getLineInfoPosition } from '../../utils/getLineInfoPosition';
import { getPointCustomData } from '../../utils/getPointCustomData';
import { LineInfo, LineInfoPointer, LineInfoWrapper } from './elements';

export const LINE_INFO_POINTER_SIZE = 9;

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
  const lineInfoLeft = getLineInfoPosition(
    chartRef.current,
    position?.x,
    lineInfoWidth
  );

  const point = head(plotHoverEvent?.points);

  const lineInfoText = useMemo(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point?.curveNumber, point?.pointNumber]);

  if (!plotHoverEvent) {
    return null;
  }

  return (
    <LineInfoWrapper
      style={{
        opacity: isVisible ? 1 : 0,
        display: isVisible ? 'initial' : 'none',
        visibility: isUndefined(lineInfoLeft) ? 'hidden' : 'visible',
      }}
    >
      <LineInfoPointer
        style={{
          left: position?.x,
          top: offsetTop + height - LINE_INFO_POINTER_SIZE,
        }}
      />
      <LineInfo
        ref={lineInfoRef}
        style={{
          left: lineInfoLeft,
          top: offsetTop + height,
        }}
      >
        {lineInfoText}
      </LineInfo>
    </LineInfoWrapper>
  );
};
