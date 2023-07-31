import { Distance } from 'convert-units';

import {
  WellTops,
  WellTopSurface,
  WellTopSurfaceDepth,
} from '@cognite/sdk-wells';

export interface WellTopsInternal
  extends Omit<
    WellTops,
    'tops' | 'measuredDepthUnit' | 'trueVerticalDepthUnit'
  > {
  measuredDepthUnit: Distance;
  trueVerticalDepthUnit: Distance;
  tops: Array<WellTopSurfaceInternal>;
}

export interface WellTopSurfaceInternal extends Omit<WellTopSurface, 'top'> {
  top: WellTopSurfaceDepthInternal;
  base?: WellTopSurfaceDepthInternal;
  color: string;
}

export type WellTopSurfaceDepthInternal = WellTopSurfaceDepth;
