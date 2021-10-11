import { DocumentPayloadLabel } from 'modules/api/documents/types';
import { DocumentLabel } from 'modules/documentSearch/types';

export const getFilteredLabels = (
  documentLabels: DocumentLabel[] = [],
  queryLabels: DocumentPayloadLabel[] = []
) => {
  const externalIds = (documentLabels || []).map((label) => label.externalId);
  return queryLabels
    .filter((label) => externalIds.includes(label.id))
    .map((filteredLabels) => filteredLabels.name);
};
