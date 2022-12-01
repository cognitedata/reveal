import { CurveSuffix } from '../types';

export const extractIdPrefix = (columnExternalId: string) => {
  return columnExternalId.substring(0, columnExternalId.lastIndexOf('_'));
};

export const extractIdSuffix = (columnExternalId: string) => {
  return columnExternalId.split('_').pop();
};

export const withSuffix = (idPrefix: string, suffix: CurveSuffix) => {
  return `${idPrefix}_${suffix}`;
};
