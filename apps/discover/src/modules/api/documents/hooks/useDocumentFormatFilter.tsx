import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';

import { formatFacetValue } from 'modules/api/documents/utils';
import { useLabels } from 'modules/documentSearch/selectors';
import {
  DocumentsFacets,
  DocumentFacet,
  FormattedFacet,
} from 'modules/documentSearch/types';
import { AppliedFilterEntries } from 'modules/sidebar/types';
import { getDocumentCategoryTitle, isRangeFacet } from 'modules/sidebar/utils';

export const useDocumentFormatFilter = () => {
  const labels = useLabels();

  return (facet: keyof DocumentsFacets, item: any) => {
    return formatFacetValue(facet, item, labels);
  };
};

export const useFormatDocumentFilters = () => {
  const labels = useLabels();
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
