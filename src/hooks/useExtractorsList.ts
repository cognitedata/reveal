import { useQuery } from 'react-query';
import { getExtractorsWithReleases } from 'service/extractors';

export const getExtractorsListQueryKey = () => ['extractors', 'list'];

export const useExtractorsList = () => {
  return useQuery(getExtractorsListQueryKey(), getExtractorsWithReleases);
};
