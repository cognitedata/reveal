import { useQuery, QueryClientConfig } from '@tanstack/react-query';
import { CogFunction } from 'types';
import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
// import { allFunctionsKey } from 'utils/queryKeys';

const allFunctionsKey = '/functions';

export const useFunctions = (config?: QueryClientConfig) => {
  return useQuery<CogFunction[]>([allFunctionsKey], () =>
    sdk
      .get(`/api/v1/projects/${getProject()}/functions`)
      .then((r) => r.data?.items)
  );
};
