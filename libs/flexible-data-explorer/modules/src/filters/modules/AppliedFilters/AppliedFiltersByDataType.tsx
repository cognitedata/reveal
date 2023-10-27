import * as React from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { ValueByDataType } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';
import unset from 'lodash/unset';

import { Chip, ChipGroup } from '@cognite/cogs.js';

import {
  APPLIED_FILTERS_CHIP_GROUP_PROPS,
  APPLIED_FILTER_CHIP_TYPE,
} from './constants';
import { getChipLabel } from './utils';

export interface AppliedFiltersByDataTypeProps {
  value?: ValueByDataType;
  onRemove?: (value: ValueByDataType) => void;
}

export const AppliedFiltersByDataType: React.FC<
  AppliedFiltersByDataTypeProps
> = ({ value = {}, onRemove }) => {
  const { t } = useTranslation();

  const handleRemove = (dataType: string, field: string) => {
    const newValue = { ...value };

    unset(newValue[dataType], field);

    if (isEmpty(newValue[dataType])) {
      unset(newValue, dataType);
    }

    onRemove?.(newValue);
  };

  return (
    <ChipGroup {...APPLIED_FILTERS_CHIP_GROUP_PROPS}>
      {Object.entries(value).flatMap(([dataType, valueByField]) => {
        return Object.entries(valueByField).map(([field, fieldValue]) => {
          const label = getChipLabel({ dataType, field, fieldValue, t });

          return (
            <Chip
              key={label}
              type={APPLIED_FILTER_CHIP_TYPE}
              label={label}
              onRemove={() => handleRemove(dataType, field)}
            />
          );
        });
      })}
    </ChipGroup>
  );
};
