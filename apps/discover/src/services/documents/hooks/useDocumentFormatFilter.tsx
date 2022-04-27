import { formatFacetValue } from 'services/documents/utils/formatFacetValue';
import { useLabelsQuery } from 'services/labels/useLabelsQuery';

import { DocumentsFacets } from 'modules/documentSearch/types';

export const useDocumentFormatFilter = (hidePrefix?: boolean) => {
  const labels = useLabelsQuery();

  return (facet: keyof DocumentsFacets, item: any) => {
    return formatFacetValue(facet, item, labels, hidePrefix);
  };
};
