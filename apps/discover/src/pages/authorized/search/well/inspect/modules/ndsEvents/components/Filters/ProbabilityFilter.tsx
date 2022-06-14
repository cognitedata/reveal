import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { MultiSelect } from 'components/Filters';

import {
  FILTER_THEME,
  FILTER_WIDTH,
  PROBABILITY_FILTER_TITLE,
} from './constants';
import { ProbabilityFilterProps } from './types';
import { getMultiSelectDisplayValue } from './utils';

export const ProbabilityFilter: React.FC<ProbabilityFilterProps> = ({
  probabilities,
  appliedProbabilities,
  onChangeProbability,
}) => {
  return (
    <div>
      <MultiSelect
        theme={FILTER_THEME}
        width={FILTER_WIDTH}
        title={PROBABILITY_FILTER_TITLE}
        options={probabilities}
        selectedOptions={appliedProbabilities}
        displayValue={getMultiSelectDisplayValue(
          probabilities,
          appliedProbabilities
        )}
        onValueChange={onChangeProbability}
        enableSelectAll={!isEmpty(probabilities)}
        showCustomCheckbox
        hideClearIndicator
      />
    </div>
  );
};
