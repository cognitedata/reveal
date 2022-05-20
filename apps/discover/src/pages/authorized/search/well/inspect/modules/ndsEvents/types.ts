import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';

import { ConvertedDistance } from 'utils/units/constants';

export interface NdsView extends NdsDataLayer {
  wellName: string;
  wellboreName: string;
  holeStartTvd?: ConvertedDistance;
  holeEndTvd?: ConvertedDistance;
}

export interface FilterData {
  label: string;
  value: string;
  options?: FilterData[];
}
