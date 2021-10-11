import { DoubleWithUnit } from '@cognite/sdk-wells/dist/src/client/model/DoubleWithUnit';

import { Wellbore } from 'modules/wellSearch/types';

export interface OverviewModel extends Omit<Wellbore, 'wellbores'> {
  wellName?: string;
  source?: string;
  operator?: string;
  spudDate?: string;
  waterDepth?: DoubleWithUnit;
  md?: string;
  tvd?: string;
  sources?: string[];
  field?: string;
}
