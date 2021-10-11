import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

import { getDateOrDefaultText } from '_helpers/date';
import { Labels, DocumentsFacets } from 'modules/documentSearch/types';
import {
  getDocumentCategoryTitle,
  isDocumentDateFacet,
} from 'modules/sidebar/utils';

export const formatFacetValue = (
  facet: keyof DocumentsFacets,
  item: any,
  labels: Labels
): string => {
  if (isDocumentDateFacet(facet)) {
    if (!isArray(item) || item.length !== 2) {
      throw new Error('Must be an array with [start, end] date');
    }

    const startDate = getDateOrDefaultText(new Date(Number(item[0])));
    const endDate = getDateOrDefaultText(new Date(Number(item[1])));
    const prefix = facet && getDocumentCategoryTitle(facet);
    return `${prefix}: ${startDate}-${endDate}`;
  }
  if (facet === 'labels') {
    if (isObject(item) && !('externalId' in item)) {
      throw new Error(
        'Labels needs to be an object with externalId as property'
      );
    }
    return labels[item.externalId] || item.externalId;
  }
  return item;
};
