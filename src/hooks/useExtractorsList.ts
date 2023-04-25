import { useFlag } from '@cognite/react-feature-flags';
import { QueryClient, useQuery, useQueryClient } from 'react-query';

import {
  ExtractorWithReleases,
  getExtractorsWithReleases,
} from 'service/extractors';

export const getExtractorsListQueryKey = (
  shouldShowUnreleased: boolean,
  shouldShowHostedExtractors: boolean
) => ['extractors', 'list', shouldShowUnreleased, shouldShowHostedExtractors];
export const getExtractorQueryKey = (
  externalId: string,
  shouldShowUnreleased: boolean
) => ['extractors', 'externalId', externalId, shouldShowUnreleased];

const getExtractorList = async ({
  shouldShowUnreleased,
  shouldShowHostedExtractors,
}: {
  shouldShowUnreleased?: boolean;
  shouldShowHostedExtractors?: boolean;
}): Promise<ExtractorWithReleases[]> => {
  const extractorsWithReleases = await getExtractorsWithReleases({
    shouldShowHostedExtractors,
  });

  if (!shouldShowUnreleased) {
    return extractorsWithReleases.filter(({ type }) => type !== 'unreleased');
  }

  return extractorsWithReleases;
};

const fetchExtractorsListQuery = (
  queryClient: QueryClient,
  {
    shouldShowUnreleased = false,
    shouldShowHostedExtractors = false,
  }: {
    shouldShowUnreleased?: boolean;
    shouldShowHostedExtractors?: boolean;
  }
) => {
  return queryClient.fetchQuery<ExtractorWithReleases[]>(
    getExtractorsListQueryKey(shouldShowUnreleased, shouldShowHostedExtractors),
    async () =>
      getExtractorList({ shouldShowUnreleased, shouldShowHostedExtractors })
  );
};

export const useExtractorsList = () => {
  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  const { isEnabled: shouldShowHostedExtractors } = useFlag(
    'FUSION_HOSTED_EXTRACTORS'
  );

  return useQuery(
    getExtractorsListQueryKey(shouldShowUnreleased, shouldShowHostedExtractors),
    async () =>
      getExtractorList({
        shouldShowUnreleased,
        shouldShowHostedExtractors,
      })
  );
};

export const useExtractor = (externalId: string) => {
  const queryClient = useQueryClient();

  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  const { isEnabled: shouldShowHostedExtractors } = useFlag(
    'FUSION_HOSTED_EXTRACTORS'
  );

  return useQuery<ExtractorWithReleases | undefined>(
    getExtractorQueryKey(externalId, shouldShowUnreleased),
    async () => {
      const extractorsList = await fetchExtractorsListQuery(queryClient, {
        shouldShowUnreleased,
        shouldShowHostedExtractors,
      });

      return extractorsList.find(({ externalId: tId }) => tId === externalId);
    }
  );
};
