import { Well as WellV2 } from '@cognite/sdk-wells-v2';
import { Point } from '@cognite/seismic-sdk-js';

import { Wellbore } from '../../wellbore/internal/types';

export interface Well extends Omit<WellV2, 'id' | 'wellbores'> {
  id: string;
  geometry?: Point;
  wellbores?: Wellbore[];
  description?: string;
  spudDate?: any;

  // 'sources' is an array of objects
  // this key respesents just those values in csv
  // eg: 'source1, source2'
  sourceList: string;
}
