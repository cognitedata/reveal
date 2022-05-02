import React from 'react';

import get from 'lodash/get';

import { X_AXIS_LABELS_HEIGHT } from 'components/Charts/constants';

import { Axis, AxisPlacement } from '../Axis';

import { ChartStickyElement } from './elements';
import { XAxisStickyProps } from './types';

export const XAxisSticky: React.FC<XAxisStickyProps> = React.memo(
  ({
    chartDimensions,
    xAxisPlacement,
    xScale,
    xAxisTicks,
    xAxisExtraProps,
  }) => {
    const isXAxisOnTop = xAxisPlacement === AxisPlacement.Top;
    const translate = isXAxisOnTop ? `translate(0, 22)` : `translate(0, 0)`;

    return (
      <ChartStickyElement
        width={chartDimensions.width}
        height={get(X_AXIS_LABELS_HEIGHT, xAxisPlacement)}
      >
        <Axis
          placement={xAxisPlacement as AxisPlacement}
          scale={xScale}
          translate={translate}
          ticks={xAxisTicks}
          {...xAxisExtraProps}
        />
      </ChartStickyElement>
    );
  }
);
