import {
  searchConfigData,
  SearchConfigDataType,
  SEARCH_CONFIG_LOCAL_STORAGE_KEY,
} from '@data-exploration-lib/core';

import { getSearchConfig } from '../getSearchConfig';

const newConfig: SearchConfigDataType = {
  ...searchConfigData,
  asset: {
    ...searchConfigData.asset,
    name: { ...searchConfigData.asset.name, enabled: false },
  },
};
describe('getSearchConfig', () => {
  it('should return default value', () => {
    expect(getSearchConfig()).toEqual(searchConfigData);
  });

  it('should return new value', () => {
    window.localStorage.setItem(
      SEARCH_CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify(newConfig)
    );
    expect(getSearchConfig()).toStrictEqual(newConfig);
    window.localStorage.clear();
  });
});
