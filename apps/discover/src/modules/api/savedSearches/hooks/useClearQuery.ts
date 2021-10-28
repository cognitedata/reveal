import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';

export const useClearQuery = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return () =>
    mutateAsync({
      query: '',
    });
};

export const useSetQuery = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return (query: string) => mutateAsync({ query });
};
