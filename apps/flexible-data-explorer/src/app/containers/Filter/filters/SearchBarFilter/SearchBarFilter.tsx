import { useMemo } from 'react';

import { useFDM } from '../../../../providers/FDMProvider';
import { FilterBuilderByDataType } from '../../containers';
import { ValueByDataType } from '../../types';

import { customDataTypeOptions } from './customFilters';
import { transformDefTypesToFilterOptions } from './utils';

export interface SearchBarFilterProps {
  value?: ValueByDataType;
  onChange: (value: ValueByDataType) => void;
}

export const SearchBarFilter: React.FC<SearchBarFilterProps> = ({
  value,
  onChange,
}) => {
  const client = useFDM();

  const dataTypes = useMemo(() => {
    return [
      ...customDataTypeOptions,
      ...transformDefTypesToFilterOptions(client.allDataTypes),
    ];
  }, [client.allDataTypes]);

  return (
    <FilterBuilderByDataType
      dataTypes={dataTypes}
      value={value}
      onChange={onChange}
    />
  );
};
