import get from 'lodash/get';

import { ProjectConfig } from '@cognite/discover-api-types';

import { useProjectConfigGetQuery } from 'modules/api/projectConfig/useProjectConfigQuery';

export const useProjectConfig = useProjectConfigGetQuery;

// cannot do "key: keyof ProjectConfig" instead of "key: string"
// because we use nested gets, eg: 'general.searchableLayerTitle'
export const useProjectConfigByKey = <P = ProjectConfig>(key: string) => {
  const queryResult = useProjectConfig();
  return {
    ...queryResult,
    data: queryResult.data ? (get(queryResult.data, key) as P) : undefined,
  };
};
