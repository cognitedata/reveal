import { endsWithAny } from 'utils/filter/endsWithAny';

import { CurveSuffix } from '../types';

import { getCurveSuffixPrecedence } from './getCurveSuffixPrecedence';
import { extractIdPrefix, extractIdSuffix } from './handleId';

export const getSortingId = (columnExternalId: string) => {
  const hasSuffix = endsWithAny(columnExternalId, [
    CurveSuffix.LOW,
    CurveSuffix.ML,
    CurveSuffix.HIGH,
  ]);

  if (!hasSuffix) {
    return columnExternalId;
  }

  const suffix = extractIdSuffix(columnExternalId);

  if (!suffix) {
    return columnExternalId;
  }

  const prefix = extractIdPrefix(columnExternalId);
  const precedence = getCurveSuffixPrecedence(suffix);

  return `${prefix}_${precedence}`;
};
