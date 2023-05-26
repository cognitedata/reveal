import * as React from 'react';
import { useState } from 'react';

import {
  Field,
  FilterValue,
  InputType,
  Operator,
  Option,
  ValueType,
} from '../../types';
import { getFilterByFieldType } from '../../utils';
import { DataTypeSelector } from '../DataTypeSelector';
import { FieldSelector } from '../FieldSelector';

export interface FilterMenuProps {
  options: Option[];
  value?: FilterValue;
  onChange: (value: FilterValue) => void;
}

export const FilterMenu: React.FC<FilterMenuProps> = ({
  options,
  value: initialValue = {},
  onChange,
}) => {
  const [selectedField, setSelectedField] = useState<Field>();
  const [selectedDataType, setSelectedDataType] = useState<Option>();
  const [filterValue, setFilterValue] = useState<FilterValue>(initialValue);

  const handleApplyClick = (
    operator: Operator,
    value: ValueType<InputType>
  ) => {
    if (!selectedField || !selectedDataType) {
      return;
    }

    const dataType = selectedDataType.name;
    const field = selectedField.name;

    const newFilterValue = {
      ...filterValue,
      [dataType]: {
        ...filterValue[dataType],
        [field]: {
          operator,
          value,
        },
      },
    };

    setFilterValue(newFilterValue);
    onChange(newFilterValue);
  };

  if (selectedDataType && selectedField) {
    const dataType = selectedDataType.name;
    const field = selectedField.name;

    const Filter = getFilterByFieldType(selectedField.type);

    return (
      <Filter
        name={selectedField.name}
        value={filterValue[dataType]?.[field]}
        onBackClick={() => setSelectedField(undefined)}
        onApplyClick={handleApplyClick}
      />
    );
  }

  if (selectedDataType) {
    return (
      <FieldSelector
        name={selectedDataType.name}
        fields={selectedDataType.fields}
        onBackClick={() => setSelectedDataType(undefined)}
        onSelectField={setSelectedField}
      />
    );
  }

  return (
    <DataTypeSelector
      dataTypes={options}
      onSelectDataType={setSelectedDataType}
    />
  );
};
