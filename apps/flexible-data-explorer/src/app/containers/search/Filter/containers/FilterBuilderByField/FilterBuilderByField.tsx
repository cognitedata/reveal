import * as React from 'react';
import { useState } from 'react';

import {
  Field,
  InputType,
  Operator,
  OperatorConfig,
  ValueByField,
  ValueType,
} from '../../types';
import { FieldSelector } from '../FieldSelector';
import { FilterByField } from '../FilterByField';

export interface FilterBuilderByFieldProps {
  name: string;
  fields: Field[];
  value?: ValueByField;
  config?: OperatorConfig;
  onBackClick: () => void;
  onChange: (value: ValueByField) => void;
}

export const FilterBuilderByField: React.FC<FilterBuilderByFieldProps> = ({
  name,
  fields,
  value: initialValue = {},
  config = {},
  onBackClick,
  onChange,
}) => {
  const [selectedField, setSelectedField] = useState<Field>();
  const [value, setValue] = useState<ValueByField>(initialValue);

  const handleApplyClick = (
    operator: Operator,
    newValue: ValueType<InputType>
  ) => {
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
      <FilterByField
        field={selectedField}
        value={value[selectedField.name]}
        operators={config[selectedField.type]}
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
    />
  );
};
