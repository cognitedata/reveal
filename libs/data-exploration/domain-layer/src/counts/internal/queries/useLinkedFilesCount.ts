import { useLinkedDocumentsCountQuery } from '../../service';

export const useLinkedFilesCount = (resourceId?: number) => {
  const { data = 0, isLoading } = useLinkedDocumentsCountQuery(resourceId);

  return { data, isLoading };
};
