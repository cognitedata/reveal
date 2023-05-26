import { useMemo } from 'react';

import noop from 'lodash/noop';

import { useTypesDataModelQuery } from '../../../services/dataModels/query/useTypesDataModelQuery';

import { FilterMenu } from './containers';
import { transformDefTypesToFilterOptions } from './utils';

export const Filter: React.FC = () => {
  const { data = [] } = useTypesDataModelQuery();

  const options = useMemo(() => {
    return transformDefTypesToFilterOptions(data);
  }, [data]);

  return <FilterMenu options={options} onChange={noop} />;
};
