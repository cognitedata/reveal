import { useCallback, useEffect, useRef } from 'react';

import * as d3Axis from 'd3-axis';
import { select } from 'd3-selection';
import get from 'lodash/get';

import { DEFAULT_AXIS_TICK_PADDING } from 'components/Charts/constants';

import { AxisProps } from './types';

export const Axis = ({
  placement,
  scale,
  tickSize,
  tickPadding,
  ticks,
  translate,
  hideAxisTicks,
  hideAxisLabels,
  formatAxisLabel,
}: AxisProps) => {
  const axisRef = useRef<SVGGElement>(null);

  const renderAxis = useCallback(() => {
    const axisType = `axis${placement}`;
    const axis = get(d3Axis, axisType)();

    if (axis) {
      axis
        .scale(scale)
        .tickSize(hideAxisTicks ? 0 : -(tickSize || 0))
        .tickPadding(tickPadding || DEFAULT_AXIS_TICK_PADDING)
        .ticks(ticks)
        .tickFormat(hideAxisLabels ? '' : formatAxisLabel);

      select(axisRef.current).call(axis);
    }
  }, [
    placement,
    scale,
    hideAxisTicks,
    tickPadding,
    ticks,
    hideAxisLabels,
    tickSize,
    formatAxisLabel,
  ]);

  useEffect(
    () => renderAxis(),
    [placement, scale, tickSize, translate, renderAxis]
  );

  return (
    <g
      className={`Axis Axis-${placement}`}
      data-testid={`axis-${placement}`}
      ref={axisRef}
      transform={translate}
    />
  );
};
