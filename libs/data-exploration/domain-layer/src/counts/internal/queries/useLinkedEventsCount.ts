import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedEventsCount = (resourceId?: number) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'events',
  });

  return { data, isLoading };
};
