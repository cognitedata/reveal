import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { ExtractorType } from 'service/extractors';

export const getSolutionsQueryKey = () => ['solutions', 'list'];
export const getSolutionsForSourceSystemQueryKey = (
  sourceSystemExternalId: string
) => ['solutions', 'list', 'source-system', sourceSystemExternalId];

export type Solution = {
  externalId: string;
  extractorExternalId: string;
  documentation: string;
  sourceSystemExternalId: string;
  type: ExtractorType;
};

const getSolutions = (sdk: CogniteClient): Promise<Solution[]> => {
  return sdk
    .get<{ items: Solution[] }>(
      `api/v1/projects/${getProject()}/extractors/solutions`,
      {
        headers: {
          'cdf-version': 'beta',
        },
      }
    )
    .then((res) => res.data.items);
};

const fetchSolutionsQuery = (queryClient: QueryClient, sdk: CogniteClient) => {
  return queryClient.fetchQuery<Solution[]>(getSolutionsQueryKey(), async () =>
    getSolutions(sdk)
  );
};

export const useSolutions = () => {
  const sdk = useSDK();

  return useQuery<Solution[]>(getSolutionsQueryKey(), () => getSolutions(sdk));
};

export const useSolutionsForSourceSystem = (sourceSystemExternalId: string) => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useQuery(
    getSolutionsForSourceSystemQueryKey(sourceSystemExternalId),
    async () => {
      const solutions = await fetchSolutionsQuery(queryClient, sdk);

      return solutions.filter(
        ({ sourceSystemExternalId: testId }) =>
          testId === sourceSystemExternalId
      );
    }
  );
};
