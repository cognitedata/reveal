import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type PointOfInterest } from '../../../architecture';
import { type CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { queryKeys } from '../../../utilities/queryKeys';
import { usePoiDomainObject } from './usePoiDomainObject';

export function useCommentsForPoiQuery(
  poi: PointOfInterest<unknown> | undefined
): UseQueryResult<CommentProperties[]> {
  const domainObject = usePoiDomainObject();

  return useQuery({
    queryKey: queryKeys.poiCommentsById(poi?.id),
    queryFn: async () => {
      if (poi === undefined || domainObject === undefined) {
        return undefined;
      }
      return [...(await domainObject.getCommentsForPoi(poi))];
    },
    enabled: domainObject !== undefined && poi !== undefined
  });
}
