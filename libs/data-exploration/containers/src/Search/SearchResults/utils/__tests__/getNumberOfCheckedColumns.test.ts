import { getMockSearchConfig } from '@data-exploration-lib/core';

import { getNumberOfCheckedColumns } from '../getNumberOfCheckedColumns';

const searchConfigData = getMockSearchConfig();
describe('getNumberOfCheckedColumns', () => {
  it('should return length 5', () => {
    expect(getNumberOfCheckedColumns(searchConfigData, 0)).toEqual(5);
  });

  it('should return length 4', () => {
    expect(
      getNumberOfCheckedColumns(
        {
          ...searchConfigData,
          asset: {
            ...searchConfigData.asset,
            name: { ...searchConfigData.asset.name, enabled: false },
          },
        },
        0
      )
    ).toEqual(4);
  });
});
