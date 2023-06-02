import { useMemo } from 'react';

import noop from 'lodash/noop';

import { useTypesDataModelQuery } from '../../../../../services/dataModels/query/useTypesDataModelQuery';
import { FilterBuilderByDataType } from '../../containers';

import { transformDefTypesToFilterOptions } from './utils';

export const SearchBarFilter: React.FC = () => {
  const { data = [] } = useTypesDataModelQuery();

  const dataTypes = useMemo(() => {
    return transformDefTypesToFilterOptions(data);
  }, [data]);

  return <FilterBuilderByDataType dataTypes={dataTypes} onChange={noop} />;
};
