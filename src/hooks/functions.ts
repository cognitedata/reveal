import { useQuery } from '@tanstack/react-query';
import { CogFunction } from 'types';
import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';

const allFunctionsKey = '/functions';

export const useFunctions = () => {
  return useQuery<CogFunction[]>([allFunctionsKey], () =>
    sdk
      .get(`/api/v1/projects/${getProject()}/functions`)
      .then((r) => r.data?.items)
  );
};
