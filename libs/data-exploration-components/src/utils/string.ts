import { getTitle, ResourceType } from 'types';
import {
  withThousandSeparator,
  withThousandSeparatorStringExtended,
  formatBigNumbersWithSuffixStringExtended,
} from './numbers';

export const stringContains = (value?: string, searchText?: string) => {
  if (!searchText) {
    return true;
  }
  try {
    return value && value.toUpperCase().search(searchText.toUpperCase()) >= 0;
  } catch (e) {
    return false;
  }
};

export const capitalizeFirstLetter = (value?: string) => {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getTabCountLabel = (count: number | string): string => {
  return `${formatBigNumbersWithSuffixStringExtended(count)}`;
};

export const getSearchResultCountLabel = (
  loadedCount: number,
  totalCount: number | string,
  resourceType: ResourceType
): string => {
  return `${withThousandSeparator(
    loadedCount
  )} of ${withThousandSeparatorStringExtended(totalCount)} ${getTitle(
    resourceType,
    Number(totalCount) != 1
  ).toLowerCase()}`;
};
