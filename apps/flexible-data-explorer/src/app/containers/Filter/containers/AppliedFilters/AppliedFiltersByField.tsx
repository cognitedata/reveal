import * as React from 'react';

import unset from 'lodash/unset';

import { ValueByField } from '../../types';

import { AppliedFilterChip } from './AppliedFilterChip';

export interface AppliedFiltersByFieldProps {
  dataType?: string;
  value?: ValueByField;
  onRemove?: (value: ValueByField) => void;
}

export const AppliedFiltersByField: React.FC<AppliedFiltersByFieldProps> = ({
  dataType,
  value = {},
  onRemove,
}) => {
  const handleRemove = (field: string) => {
    const newValue = { ...value };
    unset(newValue, field);

    onRemove?.(newValue);
  };

  return (
    <>
      {Object.entries(value).map(([field, fieldValue]) => {
        return (
          <AppliedFilterChip
            dataType={dataType}
            field={field}
            fieldValue={fieldValue}
            onRemove={handleRemove}
          />
        );
      })}
    </>
  );
};
