import { useProjectConfigGetQuery } from 'domain/projectConfig/internal/queries/useProjectConfigGetQuery';

import get from 'lodash/get';

import { ProjectConfig } from '@cognite/discover-api-types';

export const useProjectConfig = useProjectConfigGetQuery;

export const useProjectConfigByKey = <K extends keyof ProjectConfig>(
  key: K
) => {
  const queryResult = useProjectConfig();
  return {
    ...queryResult,
    data: get(queryResult.data, key),
  };
};
