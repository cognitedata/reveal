import * as React from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { ValueByField } from '@fdx/shared/types/filters';
import unset from 'lodash/unset';

import { Chip, ChipGroup } from '@cognite/cogs.js';

import {
  APPLIED_FILTERS_CHIP_GROUP_PROPS,
  APPLIED_FILTER_CHIP_TYPE,
} from './constants';
import { getChipLabel } from './utils';
export interface AppliedFiltersByFieldProps {
  value?: ValueByField;
  onRemove?: (value: ValueByField) => void;
}

export const AppliedFiltersByField: React.FC<AppliedFiltersByFieldProps> = ({
  value = {},
  onRemove,
}) => {
  const { t } = useTranslation();

  const handleRemove = (field: string) => {
    const newValue = { ...value };
    unset(newValue, field);

    onRemove?.(newValue);
  };

  return (
    <ChipGroup {...APPLIED_FILTERS_CHIP_GROUP_PROPS}>
      {Object.entries(value).map(([field, fieldValue]) => {
        const label = getChipLabel({ fieldValue, t });

        return (
          <Chip
            data-testid="applied-filter-chip"
            key={label}
            type={APPLIED_FILTER_CHIP_TYPE}
            label={label}
            onRemove={() => handleRemove(field)}
          />
        );
      })}
    </ChipGroup>
  );
};
