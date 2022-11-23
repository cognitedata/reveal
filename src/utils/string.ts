import { getTitle, ResourceType } from 'types';

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

export const getSearchResultCountLabel = (
  loadedCount: number,
  totalCount: number | string,
  resourceType: ResourceType
): string => {
  return `${loadedCount} of ${totalCount} ${getTitle(
    resourceType,
    totalCount <= 1
  ).toLowerCase()}`;
};
