import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';
import get from 'lodash/get';

import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import { TooltipRendererProps } from '../../types';
import { getTooltipPosition } from '../../utils/getTooltipPosition';

import { TooltipDetail } from './TooltipDetail';
import { TooltipContainer, TooltipWrapper } from './elements';

export interface TooltipProps {
  chartRef: React.RefObject<HTMLDivElement>;
  plotHoverEvent?: PlotHoverEvent;
  xAxisName?: string;
  yAxisName?: string;
  backgroundColor?: string;
  disableTooltip?: boolean;
  renderTooltipContent?: (props: TooltipRendererProps) => JSX.Element;
  onHover?: () => void;
  onUnhover?: () => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  chartRef,
  plotHoverEvent,
  xAxisName = 'X',
  yAxisName = 'Y',
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  disableTooltip,
  renderTooltipContent,
  onHover,
  onUnhover,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltipWidth, setTooltipWidth] = useState<number>();
  const [tooltipHeight, setTooltipHeight] = useState<number>();

  const { x, y } = useMemo(() => {
    return getTooltipPosition(
      chartRef,
      plotHoverEvent,
      tooltipWidth,
      tooltipHeight
    );
  }, [chartRef, plotHoverEvent, tooltipWidth, tooltipHeight]);

  const point = head(plotHoverEvent?.points);

  const updateTooltipWidth = useCallback(() => {
    setTooltipWidth(tooltipRef.current?.clientWidth);
    setTooltipHeight(tooltipRef.current?.clientHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    plotHoverEvent,
    tooltipRef.current?.clientWidth,
    tooltipRef.current?.clientHeight,
  ]);

  useEffect(() => {
    updateTooltipWidth();
  }, [updateTooltipWidth]);

  const getTooltipContent = () => {
    if (!point) {
      return null;
    }

    if (renderTooltipContent) {
      return renderTooltipContent({
        x: point.x,
        y: point.y,
        name: point.data.name,
        color: String(point.data.line.color),
        customData: get(point.data, 'customData'),
      });
    }

    return (
      <TooltipContainer>
        <TooltipDetail
          label={xAxisName}
          value={point?.x}
          backgroundColor={backgroundColor}
        />
        <TooltipDetail
          label={yAxisName}
          value={point?.y}
          backgroundColor={backgroundColor}
        />
      </TooltipContainer>
    );
  };

  if (disableTooltip) {
    return null;
  }

  const isTooltipVisible = tooltipWidth && plotHoverEvent;

  return (
    <TooltipWrapper
      ref={tooltipRef}
      style={{
        top: y,
        left: x,
        visibility: isTooltipVisible ? 'visible' : 'hidden',
        opacity: isTooltipVisible ? 1 : 0,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      {getTooltipContent()}
    </TooltipWrapper>
  );
};
