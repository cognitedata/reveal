import isEmpty from 'lodash/isEmpty';
import pluralize from 'pluralize';

import { TFunction } from '../hooks/useTranslation';

export const getCountsString = (
  counts: Record<string, number>,
  t: TFunction
) => {
  if (isEmpty(counts)) {
    return '';
  }

  const countStrings = Object.entries(counts).map(
    ([dataType, count]) => `${count} ${pluralize(dataType, count)}`
  );

  if (countStrings.length === 1) {
    return countStrings[0];
  }

  const and = t('GENERAL_AND');

  if (countStrings.length === 2) {
    return countStrings.join(` ${and} `);
  }

  const last = countStrings.pop();
  return `${countStrings.join(', ')}, ${and} ${last}`;
};

/**
 * Converts a camelCase or snake_case string to a sentence.
 */
export const caseToWords = (input: string) => {
  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle consecutive uppercase letters
    .replace(/(^[_\s]+|[_\s]+$)/g, '') // Remove leading and trailing underscores and spaces
    .split(/[_\s]+/) // Split by one or more underscores or spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');

  return words;
};
