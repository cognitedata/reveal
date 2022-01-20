import { DocumentPayload } from '@cognite/discover-api-types';

import { DocumentLabel } from 'modules/documentSearch/types';

export const getFilteredLabels = (
  documentLabels: DocumentLabel[] = [],
  queryLabels: DocumentPayload[] = []
) => {
  const externalIds = (documentLabels || []).map((label) => label.externalId);
  return queryLabels
    .filter((label) => (label.id ? externalIds.includes(label.id) : false))
    .map((filteredLabels) => filteredLabels.name);
};
