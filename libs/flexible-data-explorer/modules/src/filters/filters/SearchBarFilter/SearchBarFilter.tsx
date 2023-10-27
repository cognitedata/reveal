import { useMemo } from 'react';

import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { ValueByDataType } from '@fdx/shared/types/filters';

import { FilterBuilderByDataType } from '../../modules/FilterBuilderByDataType';

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
