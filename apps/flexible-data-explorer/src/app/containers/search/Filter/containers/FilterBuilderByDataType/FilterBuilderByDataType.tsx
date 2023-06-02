import * as React from 'react';
import { useState } from 'react';

import {
  DataTypeOption,
  OperatorConfig,
  ValueByDataType,
  ValueByField,
} from '../../types';
import { DataTypeSelector } from '../DataTypeSelector';
import { FilterBuilderByField } from '../FilterBuilderByField';

export interface FilterBuilderByDataTypeProps {
  dataTypes: DataTypeOption[];
  value?: ValueByDataType;
  config?: OperatorConfig;
  onChange: (value: ValueByDataType) => void;
}

export const FilterBuilderByDataType: React.FC<
  FilterBuilderByDataTypeProps
> = ({ dataTypes, value: initialValue = {}, config, onChange }) => {
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
        fields={selectedDataType.fields}
        value={value[selectedDataType.name]}
        config={config}
        onBackClick={() => setSelectedDataType(undefined)}
        onChange={handleChange}
      />
    );
  }

  return (
    <DataTypeSelector
      dataTypes={dataTypes}
      onSelectDataType={setSelectedDataType}
    />
  );
};
