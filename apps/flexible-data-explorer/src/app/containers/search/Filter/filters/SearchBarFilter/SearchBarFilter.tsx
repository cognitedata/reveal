import { useMemo } from 'react';

import { useTypesDataModelQuery } from '../../../../../services/dataModels/query/useTypesDataModelQuery';
import { FilterBuilderByDataType } from '../../containers';
import { ValueByDataType } from '../../types';

import { transformDefTypesToFilterOptions } from './utils';

export interface SearchBarFilterProps {
  value: ValueByDataType;
  onChange: (value: ValueByDataType) => void;
}

export const SearchBarFilter: React.FC<SearchBarFilterProps> = ({
  value,
  onChange,
}) => {
  const { data = [] } = useTypesDataModelQuery();

  const dataTypes = useMemo(() => {
    return transformDefTypesToFilterOptions(data);
  }, [data]);

  return (
    <FilterBuilderByDataType
      dataTypes={dataTypes}
      value={value}
      onChange={onChange}
    />
  );
};
