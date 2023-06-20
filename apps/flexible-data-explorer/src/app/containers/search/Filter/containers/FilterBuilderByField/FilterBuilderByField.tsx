import * as React from 'react';
import { useState } from 'react';

import { Field, Operator, ValueByField, ValueType } from '../../types';
import { CommonFilter } from '../CommonFilter';
import { FieldSelector } from '../FieldSelector';

export interface FilterBuilderByFieldProps {
  name: string;
  fields: Field[];
  value?: ValueByField;
  onBackClick: () => void;
  onChange: (value: ValueByField) => void;
  isError?: boolean;
}

export const FilterBuilderByField: React.FC<FilterBuilderByFieldProps> = ({
  name,
  fields,
  value: initialValue = {},
  onBackClick,
  onChange,
  isError,
}) => {
  const [selectedField, setSelectedField] = useState<Field>();
  const [value, setValue] = useState<ValueByField>(initialValue);

  const handleApplyClick = (operator: Operator, newValue: ValueType) => {
    if (!selectedField) {
      return;
    }

    const updatedValue = {
      ...value,
      [selectedField.name]: {
        operator,
        value: newValue,
      },
    };

    setValue(updatedValue);
    onChange(updatedValue);
  };

  if (selectedField) {
    return (
      <CommonFilter
        field={selectedField}
        value={value[selectedField.name]}
        onBackClick={() => setSelectedField(undefined)}
        onApplyClick={handleApplyClick}
      />
    );
  }

  return (
    <FieldSelector
      name={name}
      fields={fields}
      onBackClick={onBackClick}
      onSelectField={setSelectedField}
      isError={isError}
    />
  );
};
