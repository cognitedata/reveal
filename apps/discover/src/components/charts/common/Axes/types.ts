import { Dimensions, Margins } from 'components/charts/types';

import { AxisScale } from '../Axis';

export interface AxesProps {
  scales: {
    x: AxisScale;
    y: AxisScale;
  };
  ticks: number;
  margins: Margins;
  chartDimensions: Dimensions;
}
