import groupBy from 'lodash/groupBy';

import { ExtendedRelationship } from '../../service';
import { DetailViewRelatedResourcesData } from '../types';

export const transformToDetailViewData = (
  relationships: ExtendedRelationship[]
): DetailViewRelatedResourcesData[] => {
  const details: DetailViewRelatedResourcesData[] = relationships.map(
    ({ sourceExternalId, targetExternalId, relation, labels }) => ({
      externalId: relation === 'Source' ? sourceExternalId : targetExternalId,
      relation,
      relationshipLabels: labels?.map(({ externalId }) => externalId),
    })
  );

  return Object.values(groupBy(details, 'externalId')).map((details) => ({
    ...details[0],
    relationshipLabels: Array.from(
      new Set(details.flatMap(({ relationshipLabels }) => relationshipLabels))
    ) as string[],
  }));
};
