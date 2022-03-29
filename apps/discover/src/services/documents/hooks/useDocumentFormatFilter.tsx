import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';
import { formatFacetValue } from 'services/documents/utils';

import { useLabelsQuery } from 'modules/documentSearch/hooks/useLabelsQuery';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { AppliedFilterEntries } from 'modules/sidebar/types';
import { getDocumentCategoryTitle, isRangeFacet } from 'modules/sidebar/utils';

import { DocumentFormatFilter } from '../types';

export const useDocumentFormatFilter = (hidePrefix?: boolean) => {
  const labels = useLabelsQuery();

  return (facet: keyof DocumentsFacets, item: any) => {
    return formatFacetValue(facet, item, labels, hidePrefix);
  };
};

export const useFormatDocumentFilters = () => {
  const formatFilter = useDocumentFormatFilter(true);

  return (entries: AppliedFilterEntries[]) =>
    entries.reduce((acc, [facet, value]) => {
      const facetNameDisplayFormat = getDocumentCategoryTitle(facet);

      if (isRangeFacet(facet) && !isEmpty(value)) {
        return merge(acc, {
          [facetNameDisplayFormat]: [formatFilter(facet, value)],
        });
      }

      return merge(acc, {
        [facetNameDisplayFormat]: value.map((item) =>
          formatFilter(facet, item)
        ),
      });
    }, {} as DocumentFormatFilter);
};
