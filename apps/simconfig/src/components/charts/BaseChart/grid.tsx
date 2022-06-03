import { GridColumns, GridRows } from '@visx/grid';
import type { AllGridColumnsProps } from '@visx/grid/lib/grids/GridColumns';
import type { AllGridRowsProps } from '@visx/grid/lib/grids/GridRows';
import type { GridScale } from '@visx/grid/lib/types';

import { getExtents } from '../utils';

import type { ChartGeometry, ChartScale } from './types';

interface GridProps {
  geometry: ChartGeometry;
  scale: ChartScale;
}

export function getGrid({ geometry, scale }: GridProps) {
  const { xMax, yMax } = getExtents(geometry);
  const { xScaleGetter, yScaleGetter } = scale;

  const xScale = xScaleGetter(geometry);
  const yScale = yScaleGetter(geometry);

  return {
    Horizontal: ({
      ...additionalProps
    }: Partial<AllGridRowsProps<GridScale>>) => (
      <GridRows
        height={yMax}
        scale={yScale}
        stroke="#000"
        strokeOpacity={0.1}
        strokeWidth={1}
        width={xMax}
        {...additionalProps}
      />
    ),
    Vertical: ({
      ...additionalProps
    }: Partial<AllGridColumnsProps<GridScale>>) => (
      <GridColumns
        height={yMax}
        scale={xScale}
        stroke="#000"
        strokeOpacity={0.1}
        strokeWidth={1}
        width={xMax}
        {...additionalProps}
      />
    ),
  };
}
