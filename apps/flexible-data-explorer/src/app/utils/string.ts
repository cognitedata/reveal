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
