import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedSequencesCount = (resourceId?: number) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'sequences',
  });

  return { data, isLoading };
};
