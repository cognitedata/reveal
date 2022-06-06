import React from 'react';

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
  return (
    <>
      <RiskTypeFilter
        riskTypesAndSubtypes={riskTypesAndSubtypes}
        appliedRiskTypesAndSubtypes={appliedFilters.riskType}
        onChangeRiskType={(values) => onChangeFilter('riskType', values)}
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
