import { useDocumentsClassifiersQuery } from 'src/services/query/classifier/query';

export const useActiveClassifier = () => {
  const { data, isLoading } = useDocumentsClassifiersQuery();

  return { data: data?.find((item) => item.active), isLoading };
};
