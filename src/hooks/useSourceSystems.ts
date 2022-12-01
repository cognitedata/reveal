import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

export const getSourceSystemsQueryKey = () => ['source-systems', 'list'];

export type SourceSystem = {
  externalId: string;
  name: string;
  description?: string;
  type: string; // FIXME: get full type list
  tags?: string[];
};

export const useSourceSystems = () => {
  const sdk = useSDK();

  return useQuery<SourceSystem[]>(getSourceSystemsQueryKey(), async () => {
    const solutions = await sdk
      .get<{ items: SourceSystem[] }>(
        `api/v1/projects/${getProject()}/extractors/sources`,
        {
          headers: {
            'cdf-version': 'beta',
          },
        }
      )
      .then((res) => res.data.items);

    return solutions;
  });
};
