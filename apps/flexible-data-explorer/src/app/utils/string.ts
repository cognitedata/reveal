import { TFunction } from '../hooks/useTranslation';

export const getCountsString = (
  counts: Record<string, number>,
  t: TFunction
) => {
  const countStrings = Object.entries(counts).map(
    ([dataType, count]) => `${count} ${dataType}`
  );
  const last = countStrings.pop();
  return countStrings.join(', ') + ` ${t('GENERAL_AND')} ` + last;
};
