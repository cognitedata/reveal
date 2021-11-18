import get from 'lodash/get';

import { ProjectConfig } from '@cognite/discover-api-types';

import { useProjectConfigGetQuery } from 'modules/api/projectConfig/useProjectConfigQuery';

export const useProjectConfig = useProjectConfigGetQuery;

export const useProjectConfigByKey = <P = ProjectConfig>(key: string) => {
  const queryResult = useProjectConfig();
  return {
    ...queryResult,
    data: queryResult.data ? (get(queryResult.data, key) as P) : undefined,
  };
};
