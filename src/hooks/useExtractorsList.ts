import { useFlag } from '@cognite/react-feature-flags';
import { useQuery } from 'react-query';
import { getExtractorsWithReleases } from 'service/extractors';

export const getExtractorsListQueryKey = (shouldShowUnreleased: boolean) => [
  'extractors',
  'list',
  shouldShowUnreleased,
];

export const useExtractorsList = () => {
  const { isEnabled: shouldShowUnreleased } = useFlag(
    'FUSION_UNRELEASED_EXTRACTORS'
  );

  return useQuery(getExtractorsListQueryKey(shouldShowUnreleased), async () => {
    const extractorsWithReleases = await getExtractorsWithReleases();

    if (!shouldShowUnreleased) {
      return extractorsWithReleases.filter(({ type }) => type !== 'unreleased');
    }

    return extractorsWithReleases;
  });
};
