import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import { OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';

export interface NdsView extends NdsInternalWithTvd {
  wellName?: string;
  wellboreName: string;
}

export interface AppliedFilters {
  riskType: Record<string, string[]>;
  severity: string[];
  probability: string[];
}

export type FilterValues =
  | Record<string, OptionType<MultiSelectOptionType>[] | undefined>
  | string[];
