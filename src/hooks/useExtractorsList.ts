import { useFlag } from '@cognite/react-feature-flags';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { QueryClient, useQuery, useQueryClient } from 'react-query';

import {
  Extractor,
  ExtractorType,
  ExtractorWithReleases,
  Items,
  Release,
} from 'service/extractors';

export const getExtractorsListQueryKey = (
  shouldShowUnreleased: boolean,
  shouldShowHostedExtractors: boolean
) => ['extractors', 'list', shouldShowUnreleased, shouldShowHostedExtractors];
export const ALLOWED_EXTRACTOR_TYPES: ExtractorType[] = ['global'];

export const getExtractorQueryKey = (
  externalId: string,
  shouldShowUnreleased: boolean
) => ['extractors', 'externalId', externalId, shouldShowUnreleased];

const getExtractorList = async (
  sdk: CogniteClient,
  {
    shouldShowUnreleased,
    shouldShowHostedExtractors,
  }: {
    shouldShowUnreleased?: boolean;
    shouldShowHostedExtractors?: boolean;
  }
): Promise<ExtractorWithReleases[]> => {
  const extractorsPromise = sdk
    .get<Items<Extractor>>(
      `/api/playground/projects/${sdk.project}/extractors`,
      {
        withCredentials: true,
      }
    )
    .then((res) => res.data.items);
  const releasesPromise = sdk
    .get<Items<Release>>(
      `/api/playground/projects/${sdk.project}/extractors/releases`,
      {
        withCredentials: true,
      }
    )
    .then((res) => res.data.items);
  const extractorMap: { [externalId: string]: ExtractorWithReleases } = {};
  const [extractors, releases] = await Promise.all([
    extractorsPromise,
    releasesPromise,
  ]);

  extractors.forEach((extractor) => {
    extractorMap[extractor.externalId] = {
      ...extractor,
      category: 'extractor',
      releases: [],
    };
  });

  releases.forEach((release) => {
    extractorMap[release.externalId].releases.push(release);
  });

  const extractorsWithReleases = Object.values(extractorMap);

  const extractorsToShow = extractorsWithReleases.filter(({ type }) =>
    ALLOWED_EXTRACTOR_TYPES.includes(type)
  );

  if (shouldShowUnreleased) {
    extractorsWithReleases
      .filter(({ type }) => type === 'unreleased')
      .forEach((extractor) => {
        extractorsToShow.push(extractor);
      });
  }

  return extractorsToShow;
};

const fetchExtractorsListQuery = (
  sdk: CogniteClient,
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
      getExtractorList(sdk, {
        shouldShowUnreleased,
        shouldShowHostedExtractors,
      })
  );
};

export const useExtractorsList = () => {
  const sdk = useSDK();

  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  const { isEnabled: shouldShowHostedExtractors } = useFlag(
    'FUSION_HOSTED_EXTRACTORS'
  );

  return useQuery(
    getExtractorsListQueryKey(shouldShowUnreleased, shouldShowHostedExtractors),
    async () =>
      getExtractorList(sdk, {
        shouldShowUnreleased,
        shouldShowHostedExtractors,
      })
  );
};

export const useExtractor = (externalId: string) => {
  const sdk = useSDK();
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
      const extractorsList = await fetchExtractorsListQuery(sdk, queryClient, {
        shouldShowUnreleased,
        shouldShowHostedExtractors,
      });

      return extractorsList.find(({ externalId: tId }) => tId === externalId);
    }
  );
};
