import { useEffect, useRef } from 'react';

import * as d3Axis from 'd3-axis';
import { select } from 'd3-selection';
import get from 'lodash/get';

import { TICK_PADDING } from '../constants';
import { AxisProps } from '../types';

export const Axis = ({
  placement,
  scale,
  tickSize,
  ticks,
  translate,
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
        .tickPadding([TICK_PADDING])
        .ticks([ticks]);

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
