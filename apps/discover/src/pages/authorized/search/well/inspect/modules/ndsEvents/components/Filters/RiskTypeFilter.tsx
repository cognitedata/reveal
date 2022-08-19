import * as React from 'react';

import { MultiSelectCategorized } from 'components/Filters';

import { FILTER_WIDTH, RISK_TYPE_FILTER_TITLE } from './constants';
import { RiskTypeFilterProps } from './types';

export const RiskTypeFilter: React.FC<RiskTypeFilterProps> = ({
  riskTypesAndSubtypes,
  appliedRiskTypesAndSubtypes,
  onChangeRiskType,
}) => {
  return (
    <MultiSelectCategorized
      title={RISK_TYPE_FILTER_TITLE}
      width={FILTER_WIDTH}
      options={riskTypesAndSubtypes}
      selectedOptions={appliedRiskTypesAndSubtypes}
      onValueChange={onChangeRiskType}
      boldTitle
    />
  );
};
