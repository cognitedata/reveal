import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedTimeseriesCount = (resourceId?: number) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'timeseries',
  });

  return { data, isLoading };
};
