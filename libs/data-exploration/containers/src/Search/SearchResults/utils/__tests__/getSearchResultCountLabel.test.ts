import { getSearchResultCountLabel } from '../getSearchCountLabels';

describe('getSearchResultCountLabel', () => {
  it('should return expected result ', () => {
    expect(
      getSearchResultCountLabel(
        1000,
        10000000,
        'asset',
        (_key: string, value: string) => value
      )
    ).toEqual('1 000 of 10 000 000 assets');
  });
});
