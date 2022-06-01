import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { DoubleWithUnit } from '@cognite/sdk-wells-v2/dist/src/client/model/DoubleWithUnit';

export interface OverviewModel extends Omit<Wellbore, 'wellbores' | 'sources'> {
  source?: string;
  operator?: string;
  spudDate?: string;
  waterDepth?: DoubleWithUnit;
  md?: string;
  mdUnit?: string;
  tvd?: string;
  tvdUnit?: string;
  sources?: string;
  field?: string;
}
