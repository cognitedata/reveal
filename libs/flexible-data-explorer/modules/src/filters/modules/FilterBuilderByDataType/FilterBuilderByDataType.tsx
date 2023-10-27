import * as React from 'react';
import { useState } from 'react';

import { EMPTY_OBJECT } from '@fdx/shared/constants/object';
import {
  DataTypeOption,
  ValueByDataType,
  ValueByField,
} from '@fdx/shared/types/filters';

import { DataTypeSelector } from '../DataTypeSelector';
import { FilterBuilderByField } from '../FilterBuilderByField';

export interface FilterBuilderByDataTypeProps {
  dataTypes: DataTypeOption[];
  value?: ValueByDataType;
  onChange: (value: ValueByDataType) => void;
  isError?: boolean;
}

export const FilterBuilderByDataType: React.FC<
  FilterBuilderByDataTypeProps
> = ({ dataTypes, value: initialValue = EMPTY_OBJECT, onChange, isError }) => {
  const [selectedDataType, setSelectedDataType] = useState<DataTypeOption>();
  const [value, setValue] = useState<ValueByDataType>(initialValue);

  const handleChange = (newValue: ValueByField) => {
    if (!selectedDataType) {
      return;
    }

    const updatedValue = {
      ...value,
      [selectedDataType.name]: newValue,
    };

    setValue(updatedValue);
    onChange(updatedValue);
  };

  if (selectedDataType) {
    return (
      <FilterBuilderByField
        name={selectedDataType.name}
        displayName={selectedDataType?.displayName}
        fields={selectedDataType.fields}
        value={value[selectedDataType.name]}
        onBackClick={() => setSelectedDataType(undefined)}
        onChange={handleChange}
      />
    );
  }

  return (
    <DataTypeSelector
      dataTypes={dataTypes}
      onSelectDataType={setSelectedDataType}
      isError={isError}
    />
  );
};
