import { useFlag } from '@cognite/react-feature-flags';
import { QueryClient, useQuery, useQueryClient } from 'react-query';

import {
  ExtractorWithReleases,
  getExtractorsWithReleases,
} from 'service/extractors';

export const getExtractorsListQueryKey = (shouldShowUnreleased: boolean) => [
  'extractors',
  'list',
  shouldShowUnreleased,
];
export const getExtractorQueryKey = (
  externalId: string,
  shouldShowUnreleased: boolean
) => ['extractors', 'externalId', externalId, shouldShowUnreleased];

const getExtractorList = async (
  shouldShowUnreleased: boolean
): Promise<ExtractorWithReleases[]> => {
  const extractorsWithReleases = await getExtractorsWithReleases();

  if (!shouldShowUnreleased) {
    return extractorsWithReleases.filter(({ type }) => type !== 'unreleased');
  }

  return extractorsWithReleases;
};

const fetchExtractorsListQuery = (
  queryClient: QueryClient,
  shouldShowUnreleased: boolean
) => {
  return queryClient.fetchQuery<ExtractorWithReleases[]>(
    getExtractorsListQueryKey(shouldShowUnreleased),
    async () => getExtractorList(shouldShowUnreleased)
  );
};

export const useExtractorsList = () => {
  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  return useQuery(getExtractorsListQueryKey(shouldShowUnreleased), async () =>
    getExtractorList(shouldShowUnreleased)
  );
};

export const useExtractor = (externalId: string) => {
  const queryClient = useQueryClient();

  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  return useQuery<ExtractorWithReleases | undefined>(
    getExtractorQueryKey(externalId, shouldShowUnreleased),
    async () => {
      const extractorsList = await fetchExtractorsListQuery(
        queryClient,
        shouldShowUnreleased
      );

      return extractorsList.find(({ externalId: tId }) => tId === externalId);
    }
  );
};
