import {
  getLocalStorageObjectByKey,
  searchConfigData,
  SearchConfigDataType,
  SEARCH_CONFIG_LOCAL_STORAGE_KEY,
} from '@data-exploration-lib/core';

export const getSearchConfig = () => {
  return (
    getLocalStorageObjectByKey<SearchConfigDataType>(
      SEARCH_CONFIG_LOCAL_STORAGE_KEY
    ) || searchConfigData
  );
};
