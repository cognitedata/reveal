import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import {
  Coordinate,
  TooltipRendererProps,
  ValueType,
  Variant,
} from '../../types';
import { getTooltipPosition } from '../../utils/getTooltipPosition';

import { TooltipDetail } from './TooltipDetail';
import { TooltipContainer, TooltipWrapper } from './elements';
import { getPointCustomData } from '../../utils/getPointCustomData';

export interface TooltipProps {
  chartRef: React.RefObject<HTMLDivElement>;
  variant?: Variant;
  plotHoverEvent?: PlotHoverEvent;
  xAxisName?: string;
  yAxisName?: string;
  backgroundColor?: string;
  referencePosition?: Coordinate;
  showTooltip: boolean;
  formatTooltipContent?: (
    props: TooltipRendererProps
  ) => Record<string, ValueType | undefined>;
  renderTooltipContent?: (props: TooltipRendererProps) => JSX.Element;
}

export const Tooltip: React.FC<TooltipProps> = ({
  chartRef,
  variant,
  plotHoverEvent,
  xAxisName = 'X',
  yAxisName = 'Y',
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  referencePosition,
  showTooltip,
  formatTooltipContent,
  renderTooltipContent,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltipWidth, setTooltipWidth] = useState<number>();
  const [tooltipHeight, setTooltipHeight] = useState<number>();

  const point = head(plotHoverEvent?.points);

  const { x, y } = getTooltipPosition(
    chartRef,
    plotHoverEvent,
    tooltipWidth,
    tooltipHeight,
    referencePosition
  );

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

    const tooltipRendererProps: TooltipRendererProps = {
      x: point.x,
      y: point.y,
      name: point.data.name,
      color: String(point.data.line.color),
      customData: getPointCustomData(point),
    };

    if (formatTooltipContent) {
      const content = formatTooltipContent(tooltipRendererProps);

      return (
        <TooltipContainer>
          {Object.entries(content).map(([label, value]) => {
            return (
              <TooltipDetail
                key={label}
                label={label}
                value={value}
                backgroundColor={backgroundColor}
              />
            );
          })}
        </TooltipContainer>
      );
    }

    if (renderTooltipContent) {
      return renderTooltipContent(tooltipRendererProps);
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

  if (!showTooltip) {
    return null;
  }

  const isTooltipVisible = tooltipWidth && plotHoverEvent;

  return (
    <TooltipWrapper
      ref={tooltipRef}
      className="tooltip"
      variant={variant}
      style={{
        top: y,
        left: x,
        visibility: isTooltipVisible ? 'visible' : 'hidden',
        opacity: isTooltipVisible ? 1 : 0,
      }}
    >
      {getTooltipContent()}
    </TooltipWrapper>
  );
};
