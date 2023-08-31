import pluralize from 'pluralize';

import { TFunction } from '../hooks/useTranslation';

export const getCountsString = (
  counts: Record<string, number>,
  t: TFunction
) => {
  const countStrings = Object.entries(counts).map(
    ([dataType, count]) => `${count} ${pluralize(dataType)}`
  );
  const last = countStrings.pop();
  return (
    countStrings.join(', ') +
    ` ${countStrings.length > 0 ? t('GENERAL_AND') : ''} ` +
    last
  );
};

/**
 * Converts a camelCase or snake_case string to a sentence.
 */
export const caseToWords = (input: string) => {
  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle consecutive uppercase letters
    .split(/[_\s]/) // Split by underscores and spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');

  return words;
};
