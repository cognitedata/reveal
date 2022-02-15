import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import { formatFacetValue } from 'services/documents/utils';

import { useLabelsQuery } from 'modules/documentSearch/hooks/useLabelsQuery';
import {
  DocumentsFacets,
  DocumentFacet,
  FormattedFacet,
} from 'modules/documentSearch/types';
import { AppliedFilterEntries } from 'modules/sidebar/types';
import { getDocumentCategoryTitle, isRangeFacet } from 'modules/sidebar/utils';

export const useDocumentFormatFilter = () => {
  const labels = useLabelsQuery();

  return (facet: keyof DocumentsFacets, item: any) => {
    return formatFacetValue(facet, item, labels);
  };
};

export const useFormatDocumentFilters = () => {
  const labels = useLabelsQuery();
  return (entries: AppliedFilterEntries[]) =>
    flatten(
      entries.map(([facet, value]) => {
        const facetNameDisplayFormat = getDocumentCategoryTitle(facet);
        if (isRangeFacet(facet) && !isEmpty(value)) {
          return createFormattedFacet(
            facet,
            facetNameDisplayFormat,
            formatFacetValue(facet, value, labels)
          );
        }
        return (value as (string | { externalId: string })[]).map((item) =>
          createFormattedFacet(
            facet,
            facetNameDisplayFormat,
            formatFacetValue(facet, item, labels)
          )
        );
      })
    );
};

const createFormattedFacet = (
  facet: DocumentFacet,
  facetNameDisplayFormat: string,
  facetValueDisplayFormat: string
): FormattedFacet => {
  return {
    facet,
    facetNameDisplayFormat,
    facetValueDisplayFormat,
  };
};
