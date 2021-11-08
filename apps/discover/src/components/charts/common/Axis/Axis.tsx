import { useEffect, useRef } from 'react';

import * as d3Axis from 'd3-axis';
import { select } from 'd3-selection';
import get from 'lodash/get';

import { DEFAULT_AXIS_TICK_PADDING } from 'components/charts/constants';

import { AxisProps } from './types';

export const Axis = ({
  placement,
  scale,
  tickSize,
  tickPadding,
  ticks,
  translate,
  formatAxisLabel,
}: AxisProps) => {
  const axisRef = useRef<SVGGElement>(null);

  useEffect(() => renderAxis(), [placement, scale, tickSize, translate]);

  const renderAxis = () => {
    const axisType = `axis${placement}`;
    const axis = get(d3Axis, axisType)();

    if (axis) {
      axis
        .scale(scale)
        .tickSize(tickSize ? -tickSize : 0)
        .tickPadding([tickPadding || DEFAULT_AXIS_TICK_PADDING])
        .ticks([ticks])
        .tickFormat(formatAxisLabel);

      select(axisRef.current).call(axis);
    }
  };

  return (
    <g
      className={`Axis Axis-${placement}`}
      data-testid={`axis-${placement}`}
      ref={axisRef}
      transform={translate}
    />
  );
};
