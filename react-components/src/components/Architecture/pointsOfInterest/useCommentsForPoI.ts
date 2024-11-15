/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type PointOfInterest, type PointsOfInterestDomainObject } from '../../../architecture';
import { type CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { queryKeys } from '../../../utilities/queryKeys';

export function useCommentsForPoI(
  domainObject: PointsOfInterestDomainObject<unknown>,
  poi: PointOfInterest<unknown>
): UseQueryResult<CommentProperties[]> {
  return useQuery({
    queryKey: queryKeys.poiCommentsById(poi.id),
    queryFn: async () => await domainObject.getCommentsForPoi(poi)
  });
}
