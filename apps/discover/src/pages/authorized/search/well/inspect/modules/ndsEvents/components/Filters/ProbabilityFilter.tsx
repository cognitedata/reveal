import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { MultiSelect } from 'components/Filters';

import {
  FILTER_WIDTH,
  PROBABILITY_FILTER_TITLE,
  SELECT_ALL_LABEL,
} from './constants';
import { ProbabilityFilterProps } from './types';
import { getMultiSelectDisplayValue } from './utils';

export const ProbabilityFilter: React.FC<ProbabilityFilterProps> = ({
  probabilities = [],
  appliedProbabilities = [],
  onChangeProbability,
}) => {
  return (
    <div>
      <MultiSelect
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
        selectAllLabel={SELECT_ALL_LABEL}
        hideDividerForSelectAll
      />
    </div>
  );
};
