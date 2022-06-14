import { ConvertedDistance } from 'utils/units/constants';

import { Npt } from '@cognite/sdk-wells-v3';

export interface NptInternal extends Omit<Npt, 'measuredDepth'> {
  measuredDepth?: ConvertedDistance;
}
