import { ConvertedDistance } from 'utils/units/constants';

import { Well } from '@cognite/sdk-wells-v3';
import { Point } from '@cognite/seismic-sdk-js';

import { WellboreInternal } from '../../wellbore/internal/types';

export interface WellInternal
  extends Omit<Well, 'wellbores' | 'spudDate' | 'waterDepth'> {
  id: string;
  wellbores: Array<WellboreInternal>;
  spudDate?: string | Date;
  waterDepth?: ConvertedDistance;
  geometry?: Point;

  /**
   * 'sources' is an array of objects.
   * This key respesents just those values in csv.
   * @example 'source1, source2'
   */
  sourceList: string;
}
