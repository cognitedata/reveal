import { DocumentHighlight } from '@cognite/sdk';

import { MatchingLabels } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  isExactMatch,
  isPartialMatch,
} from '../../../utils/extractMatchingLabels';

export const documentNameAndContentMatcher = (
  value: DocumentHighlight,
  query: string,
  matchers: MatchingLabels
) => {
  const documentSearchConfig = getSearchConfig().file;

  if (value.name.length && documentSearchConfig['sourceFile|name']?.enabled) {
    const hasExactMatch = value.name.some((name) => {
      return isExactMatch(
        name.replaceAll('<em>', '').replaceAll('</em>', ''),
        query
      );
    });

    const hasPartialMatch = value.name.some((name) => {
      return isPartialMatch(
        name.replaceAll('<em>', '').replaceAll('</em>', ''),
        query,
        true
      );
    });

    if (hasExactMatch) {
      matchers.exact.push('Name');
    } else if (hasPartialMatch) {
      matchers.partial.push('Name');
    } else {
      matchers.fuzzy.push('Name');
    }
  }

  if (value.content.length && documentSearchConfig.content.enabled) {
    const hasExactMatch = value.content.some((name) => {
      return isExactMatch(
        name.replaceAll('<em>', '').replaceAll('</em>', ''),
        query
      );
    });

    const hasPartialMatch = value.content.some((name) => {
      return isPartialMatch(
        name.replaceAll('<em>', '').replaceAll('</em>', ''),
        query,
        true
      );
    });

    if (hasExactMatch) {
      matchers.exact.push('Content');
    } else if (hasPartialMatch) {
      matchers.partial.push('Content');
    } else {
      matchers.fuzzy.push('Content');
    }
  }
};
