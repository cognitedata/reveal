import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useFlag } from '@cognite/react-feature-flags';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import {
  ExtractorLibraryCategory,
  EXTRACTOR_LIBRARY_CATEGORIES,
} from '../components/category-sidebar/CategorySidebarItem';
import { ExtractorBase } from '../service/extractors';

import { ALLOWED_EXTRACTOR_TYPES } from './useExtractorsList';

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

const getSourceSystems = async (
  sdk: CogniteClient,
  shouldShowUnreleased?: boolean
): Promise<SourceSystem[]> => {
  const sources = await sdk
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

  const sourcesToShow = sources.filter(({ type }) =>
    ALLOWED_EXTRACTOR_TYPES.includes(type)
  );

  if (shouldShowUnreleased) {
    sources
      .filter(({ type }) => type === 'unreleased')
      .forEach((extractor) => {
        sourcesToShow.push(extractor);
      });
  }

  return sourcesToShow;
};

const fetchSourceSystemsQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  shouldShowUnreleased?: boolean
) => {
  return queryClient.fetchQuery<SourceSystem[]>(
    getSourceSystemsQueryKey(),
    async () => getSourceSystems(sdk, shouldShowUnreleased)
  );
};

export const useSourceSystems = () => {
  const sdk = useSDK();

  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  return useQuery<SourceSystem[]>(getSourceSystemsQueryKey(), async () => {
    const sourceSystems = await getSourceSystems(sdk, shouldShowUnreleased);

    return sourceSystems;
  });
};

export const useSourceSystem = (externalId: string) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  return useQuery<SourceSystem | undefined>(
    getSourceSystemQueryKey(externalId),
    async () => {
      const sourceSystems = await fetchSourceSystemsQuery(
        sdk,
        queryClient,
        shouldShowUnreleased
      );

      return sourceSystems.find(({ externalId: tId }) => tId === externalId);
    }
  );
};
