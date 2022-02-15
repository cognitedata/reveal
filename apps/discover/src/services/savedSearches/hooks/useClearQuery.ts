import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

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
