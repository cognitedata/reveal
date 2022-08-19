import * as React from 'react';

import { OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';

import { ProbabilityFilter } from './ProbabilityFilter';
import { RiskTypeFilter } from './RiskTypeFilter';
import { SeverityFilter } from './SeverityFilter';
import { FiltersProps } from './types';

export const Filters: React.FC<FiltersProps> = ({
  riskTypesAndSubtypes,
  severities,
  probabilities,
  appliedFilters,
  onChangeFilter,
}) => {
  // The option values are { label: string, value: string }[] and we map it to string[]
  const mapOptionsToStringArray = (
    options: Record<string, OptionType<MultiSelectOptionType>[] | undefined>
  ) => {
    return Object.keys(options).reduce((previousValue, currentValue) => {
      return {
        ...previousValue,
        [currentValue]: options[currentValue]?.map((val) => {
          return val?.value || val?.label || val;
        }),
      };
    }, {});
  };

  return (
    <>
      <RiskTypeFilter
        riskTypesAndSubtypes={riskTypesAndSubtypes}
        appliedRiskTypesAndSubtypes={appliedFilters.riskType}
        onChangeRiskType={(values) =>
          onChangeFilter('riskType', mapOptionsToStringArray(values))
        }
      />

      <SeverityFilter
        severities={severities}
        appliedSeverities={appliedFilters.severity}
        onChangeSeverity={(values) => onChangeFilter('severity', values)}
      />

      <ProbabilityFilter
        probabilities={probabilities}
        appliedProbabilities={appliedFilters.probability}
        onChangeProbability={(values) => onChangeFilter('probability', values)}
      />
    </>
  );
};
