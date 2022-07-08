import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { ConvertedDistance } from 'utils/units/constants';

export interface OverviewModel
  extends Omit<WellboreInternal, 'wellbores' | 'sources'> {
  source?: string;
  operator?: string;
  spudDate?: string | Date;
  waterDepth?: ConvertedDistance;
  md?: string;
  mdUnit?: string;
  tvd?: string;
  tvdUnit?: string;
  sources?: string;
  field?: string;
}
