import { KeyValueMap } from '@platypus/platypus-core';
import { BLACKLISTED_ROW_ATTRIBUTES } from './constant';

export const sanitizeRow = (row: KeyValueMap) => {
  const cleanRow = { ...row };
  Object.keys(cleanRow).forEach((attr) => {
    if (BLACKLISTED_ROW_ATTRIBUTES.includes(attr)) {
      delete cleanRow[attr];
    }
  });
  return cleanRow;
};
