import { OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';

import { AppliedFilters, FilterValues } from '../types';

export interface FiltersProps
  extends Pick<RiskTypeFilterProps, 'riskTypesAndSubtypes'>,
    Pick<SeverityFilterProps, 'severities'>,
    Pick<ProbabilityFilterProps, 'probabilities'> {
  onChangeFilter: (filter: keyof AppliedFilters, values: FilterValues) => void;
  appliedFilters: AppliedFilters;
}

export interface RiskTypeFilterProps {
  riskTypesAndSubtypes: Record<string, string[]>;
  appliedRiskTypesAndSubtypes: Record<string, string[]>;
  onChangeRiskType: (
    values: Record<string, OptionType<MultiSelectOptionType>[] | undefined>
  ) => void;
}

export interface SeverityFilterProps {
  severities: string[];
  appliedSeverities: string[];
  onChangeSeverity: (values: string[]) => void;
}

export interface ProbabilityFilterProps {
  probabilities: string[];
  appliedProbabilities: string[];
  onChangeProbability: (values: string[]) => void;
}
