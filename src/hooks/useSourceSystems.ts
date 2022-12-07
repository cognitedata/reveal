import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import {
  ExtractorLibraryCategory,
  EXTRACTOR_LIBRARY_CATEGORIES,
} from 'components/category-sidebar/CategorySidebarItem';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { ExtractorBase } from 'service/extractors';

export const getSourceSystemsQueryKey = () => ['source-systems', 'list'];
export const getSourceSystemQueryKey = (externalId: string) => [
  'source-systems',
  'externalId',
  externalId,
];

type SourceSystemBase = ExtractorBase;
export type SourceSystem = SourceSystemBase & {
  category: ExtractorLibraryCategory;
};

const getSourceSystems = (sdk: CogniteClient): Promise<SourceSystem[]> => {
  return sdk
    .get<{ items: SourceSystemBase[] }>(
      `api/v1/projects/${getProject()}/extractors/sources`,
      {
        headers: {
          'cdf-version': 'beta',
        },
      }
    )
    .then((res) =>
      res.data.items.map((item) => ({
        ...item,
        category: EXTRACTOR_LIBRARY_CATEGORIES.sourceSystem,
      }))
    );
};

const fetchSourceSystemsQuery = (
  queryClient: QueryClient,
  sdk: CogniteClient
) => {
  return queryClient.fetchQuery<SourceSystem[]>(
    getSourceSystemsQueryKey(),
    async () => getSourceSystems(sdk)
  );
};

export const useSourceSystems = () => {
  const sdk = useSDK();

  return useQuery<SourceSystem[]>(getSourceSystemsQueryKey(), async () => {
    const sourceSystems = await getSourceSystems(sdk);

    return sourceSystems;
  });
};

export const useSourceSystem = (externalId: string) => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useQuery<SourceSystem | undefined>(
    getSourceSystemQueryKey(externalId),
    async () => {
      const sourceSystems = await fetchSourceSystemsQuery(queryClient, sdk);

      return sourceSystems.find(({ externalId: tId }) => tId === externalId);
    }
  );
};
