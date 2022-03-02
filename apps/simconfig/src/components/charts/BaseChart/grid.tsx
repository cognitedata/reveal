import { GridRows } from '@visx/grid';
import type { AllGridRowsProps } from '@visx/grid/lib/grids/GridRows';
import type { GridScale } from '@visx/grid/lib/types';

import { getExtents } from '../utils';

import type { ChartGeometry } from './types';

export function getGrid(geometry: ChartGeometry) {
  const { yScale } = geometry;
  const { xMax, yMax } = getExtents(geometry);

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
  };
}
