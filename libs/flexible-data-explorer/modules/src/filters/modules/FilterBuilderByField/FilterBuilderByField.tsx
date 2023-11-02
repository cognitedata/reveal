import * as React from 'react';
import { useState } from 'react';

import {
  Field,
  Operator,
  ValueByField,
  ValueType,
} from '@fdx/shared/types/filters';

import { CommonFilter } from '../CommonFilter';
import { FieldSelector } from '../FieldSelector';

export interface FilterBuilderByFieldProps<T = unknown> {
  name: string;
  displayName?: string;
  fields: Field<T>[];
  value?: ValueByField<T>;
  onBackClick?: () => void;
  onChange: (value: ValueByField<T>) => void;
  onSearchInputChange?: (value: string) => void;
  isError?: boolean;
  isLoading?: boolean;
}

export const FilterBuilderByField = <T,>({
  name,
  displayName,
  fields,
  value: initialValue = {},
  onBackClick,
  onChange,
  onSearchInputChange,
  isError,
  isLoading,
}: FilterBuilderByFieldProps<T>) => {
  const [selectedField, setSelectedField] = useState<Field<T>>();
  const [value, setValue] = useState<ValueByField<T>>(initialValue);

  const handleApplyClick = (operator: Operator, newValue: ValueType) => {
    if (!selectedField) {
      return;
    }

    const updatedValue: ValueByField<T> = {
      ...value,
      [selectedField.id]: {
        label: selectedField.displayName || selectedField.id,
        operator,
        value: newValue,
        type: selectedField.type,
      },
    };

    setValue(updatedValue);
    onChange(updatedValue);
  };

  if (selectedField) {
    return (
      <CommonFilter
        dataType={name}
        displayName={displayName}
        field={selectedField}
        value={value[selectedField.id]}
        onBackClick={() => setSelectedField(undefined)}
        onApplyClick={handleApplyClick}
      />
    );
  }

  return (
    <FieldSelector
      title={displayName || name}
      fields={fields}
      onBackClick={onBackClick}
      onSelectField={setSelectedField}
      onSearchInputChange={onSearchInputChange}
      isError={isError}
      isLoading={isLoading}
    />
  );
};
