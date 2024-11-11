import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PointOfInterest, PointsOfInterestDomainObject } from '../../../architecture';
import { CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { queryKeys } from '../../../utilities/queryKeys';

export function useCommentsForPoi(
  domainObject: PointsOfInterestDomainObject<unknown>,
  poi: PointOfInterest<unknown>
): UseQueryResult<CommentProperties[]> {
  return useQuery({
    queryKey: queryKeys.poiCommentsById(poi.id),
    queryFn: () => domainObject.getCommentsForPoi(poi)
  });
}
