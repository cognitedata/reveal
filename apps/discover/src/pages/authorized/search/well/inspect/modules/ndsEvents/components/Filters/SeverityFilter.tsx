import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { MultiSelect } from 'components/Filters';

import { FILTER_WIDTH, SEVERITY_FILTER_TITLE } from './constants';
import { SeverityFilterProps } from './types';
import { getMultiSelectDisplayValue } from './utils';

export const SeverityFilter: React.FC<SeverityFilterProps> = ({
  severities,
  appliedSeverities,
  onChangeSeverity,
}) => {
  return (
    <div>
      <MultiSelect
        width={FILTER_WIDTH}
        title={SEVERITY_FILTER_TITLE}
        options={severities}
        selectedOptions={appliedSeverities}
        displayValue={getMultiSelectDisplayValue(severities, appliedSeverities)}
        onValueChange={onChangeSeverity}
        enableSelectAll={!isEmpty(severities)}
        showCustomCheckbox
        hideClearIndicator
      />
    </div>
  );
};
