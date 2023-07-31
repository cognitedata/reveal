import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

export const useClearQuery = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return () =>
    mutateAsync({
      query: '',
    });
};

export const useSetQuery = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return (query: string) => mutateAsync({ query });
};
