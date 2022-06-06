import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';

import { ConvertedDistance } from 'utils/units/constants';

import { OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';

export interface NdsView extends NdsDataLayer {
  wellName: string;
  wellboreName: string;
  holeStartTvd?: ConvertedDistance;
  holeEndTvd?: ConvertedDistance;
}

export interface AppliedFilters {
  riskType: Record<string, string[]>;
  severity: string[];
  probability: string[];
}

export type FilterValues =
  | Record<string, OptionType<MultiSelectOptionType>[] | undefined>
  | string[];
