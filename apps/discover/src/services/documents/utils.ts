import head from 'lodash/head';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import tail from 'lodash/tail';
import { getDateOrDefaultText } from 'utils/date';

import { Labels, DocumentFacet } from 'modules/documentSearch/types';
import {
  getDocumentCategoryTitle,
  isDocumentDateFacet,
  isRangeFacet,
} from 'modules/sidebar/utils';

export const formatFacetValue = (
  facet: DocumentFacet,
  item: any,
  labels: Labels
): string => {
  const prefix = facet && getDocumentCategoryTitle(facet);
  if (isDocumentDateFacet(facet)) {
    if (!isArray(item) || item.length !== 2) {
      throw new Error('Must be an array with [start, end] date');
    }
    const startDate = getDateOrDefaultText(new Date(Number(item[0])));
    const endDate = getDateOrDefaultText(new Date(Number(item[1])));
    return `${prefix}: ${startDate}-${endDate}`;
  }

  if (isRangeFacet(facet)) {
    if (!isArray(item) || item.length !== 2) {
      throw new Error('Must be an array with [first, last] value');
    }
    return formatFacetValueFromTemplate(
      prefix,
      `${head(item)} – ${tail(item)}`
    );
  }

  if (facet === 'labels') {
    if (isObject(item) && !('externalId' in item)) {
      throw new Error(
        'Labels needs to be an object with externalId as property'
      );
    }
    return formatFacetValueFromTemplate(
      prefix,
      labels[item.externalId] || item.externalId
    );
  }

  return formatFacetValueFromTemplate(prefix, item);
};

const formatFacetValueFromTemplate = (prefix: string, value: string) =>
  `${prefix}: ${value}`;
