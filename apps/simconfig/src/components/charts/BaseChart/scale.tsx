import type { PickScaleConfigWithoutType } from '@visx/scale';
import { scaleLinear, scaleTime } from '@visx/scale';

import { extent, max, min } from 'd3';

import type { ChartGeometry } from './types';

export type ScaleProps = Pick<ChartGeometry, 'height' | 'margin' | 'width'>;

interface TimeScaleProps
  extends Partial<PickScaleConfigWithoutType<'time', number>> {
  datapoints: number[];
}

export function timeScale({ datapoints, ...additionalProps }: TimeScaleProps) {
  return ({ width, margin }: ScaleProps) => {
    const scale = scaleTime<number>({
      // FIXME(SIM-209) fix types to avoid assertion
      domain: extent(datapoints) as unknown as [Date, Date],
      range: [0, width - margin.left - margin.right],
      ...additionalProps,
    });
    return scale;
  };
}

interface LinearScaleProps
  extends Partial<PickScaleConfigWithoutType<'linear', number>> {
  datapoints: number[];
  padding?: number;
  boundary?: { min: number; max: number };
  axis: 'x' | 'y';
}

export function linearScale({
  datapoints,
  padding = 0.025,
  boundary,
  axis,
  ...additionalProps
}: LinearScaleProps) {
  return ({ height, width, margin }: ScaleProps) => {
    const boundaryMin = boundary?.min ?? min(datapoints) ?? 0;
    const boundaryMax = boundary?.max ?? max(datapoints) ?? 1;
    const scaleMin = boundaryMin * (1 - padding);
    const scaleMax = boundaryMax * (1 + padding);

    const scale = scaleLinear<number>({
      domain: [scaleMin, scaleMax],
      range:
        axis === 'x'
          ? [0, width - margin.left - margin.right]
          : [height - margin.top - margin.bottom, 0],
      nice: true,
      ...additionalProps,
    });
    return scale;
  };
}
