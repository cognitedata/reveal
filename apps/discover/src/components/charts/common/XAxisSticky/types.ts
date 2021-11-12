import { Dimensions } from 'components/charts/types';

import { AxisPlacement, AxisProps, AxisScale } from '../Axis';

export interface XAxisStickyProps {
  chartDimensions: Dimensions;
  xAxisPlacement: AxisPlacement;
  xScale: AxisScale;
  xAxisTicks?: number;
  xAxisExtraProps?: Partial<AxisProps>;
}
