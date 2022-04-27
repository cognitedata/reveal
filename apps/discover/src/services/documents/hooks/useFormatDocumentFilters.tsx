import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';

import { AppliedFilterEntries } from 'modules/sidebar/types';
import { getDocumentCategoryTitle, isRangeFacet } from 'modules/sidebar/utils';

import { DocumentFormatFilter } from '../types';

import { useDocumentFormatFilter } from './useDocumentFormatFilter';

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
