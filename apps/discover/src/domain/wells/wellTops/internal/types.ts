import { Distance } from 'convert-units';

import { WellTops } from '@cognite/sdk-wells/dist/src/model/wellTops';
import { WellTopSurface } from '@cognite/sdk-wells/dist/src/model/wellTopSurface';
import { WellTopSurfaceDepth } from '@cognite/sdk-wells/dist/src/model/wellTopSurfaceDepth';

export interface WellTopsInternal
  extends Omit<
    WellTops,
    'tops' | 'measuredDepthUnit' | 'trueVerticalDepthUnit'
  > {
  measuredDepthUnit: Distance;
  trueVerticalDepthUnit: Distance;
  tops: Array<WellTopSurfaceInternal>;
}

export interface WellTopSurfaceInternal extends WellTopSurface {
  color: string;
  heightDifference: number;
}

export type WellTopSurfaceDepthInternal = WellTopSurfaceDepth;
