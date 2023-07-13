import uniq from 'lodash/uniq';

import { Relationship } from '@cognite/sdk';

export const extractRelationshipLabels = (relationships: Relationship[]) => {
  return uniq(
    relationships.flatMap(({ labels = [] }) => {
      return labels.map(({ externalId }) => externalId);
    })
  );
};
