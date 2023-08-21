import * as Keys from './keys';

describe('CDF SDK Cache keys', () => {
  const filter = { filter: { assetId: 42 } };
  test('baseCacheKey', () => {
    expect(Keys.baseCacheKey('files')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
    ]);
    expect(Keys.baseCacheKey('assets')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
    ]);
  });
  test('aggregateKey', () => {
    expect(Keys.aggregateKey('files', { foo: true })).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'aggregate',
      { foo: true },
    ]);
    expect(Keys.aggregateKey('assets', { foo: true })).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'aggregate',
      { foo: true },
    ]);
  });
  test('searchBaseCacheKey', () => {
    expect(Keys.searchBaseCacheKey('files')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'search',
    ]);
    expect(Keys.searchBaseCacheKey('events')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'events',
      'search',
    ]);
  });
  test('listBaseCacheKey', () => {
    expect(Keys.listBaseCacheKey('assets')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'list',
    ]);
    expect(Keys.listBaseCacheKey('sequences')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'sequences',
      'list',
    ]);
  });
  test('infiniteBaseSearchCacheKey', () => {
    expect(Keys.infiniteBaseSearchCacheKey('assets')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'search',
      'infinite',
    ]);
    expect(Keys.infiniteBaseSearchCacheKey('files')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'search',
      'infinite',
    ]);
  });
  test('infiniteBaseListCacheKey', () => {
    expect(Keys.infiniteBaseListCacheKey('files')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'list',
      'infinite',
    ]);
    expect(Keys.infiniteBaseListCacheKey('assets')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'list',
      'infinite',
    ]);
  });
  test('infiniteListCacheKey', () => {
    expect(Keys.infiniteListCacheKey('events', filter)).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'events',
      'list',
      'infinite',
      { filter },
      { config: undefined },
    ]);
    expect(Keys.infiniteListCacheKey('assets')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'list',
      'infinite',
      { filter: undefined },
      { config: undefined },
    ]);
  });
  test('byIdKey', () => {
    expect(Keys.byIdKey('assets', { id: 42 })).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'get',
      'byId',
      { id: 42 },
    ]);
    expect(Keys.byIdKey('files', { id: 42 })).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'get',
      'byId',
      { id: 42 },
    ]);
  });

  test('listKey', () => {
    expect(Keys.listKey('events', { filter: { assetId: 42 } })).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'events',
      'list',
      { filter: { assetId: 42 } },
    ]);
    expect(Keys.listKey('files', { filter: { assetId: 42 } })).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'list',
      { filter: { assetId: 42 } },
    ]);
  });
  test('retrieveItemsKey', () => {
    expect(
      Keys.retrieveItemsKey('events', [{ id: 42 }, { externalId: 32 }])
    ).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'events',
      'get',
      'byIds',
      [{ id: 42 }, { externalId: 32 }],
    ]);
    expect(
      Keys.retrieveItemsKey('assets', [{ id: 42 }, { externalId: 32 }])
    ).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'get',
      'byIds',
      [{ id: 42 }, { externalId: 32 }],
    ]);
  });
  test('searchCacheKey', () => {
    expect(Keys.searchCacheKey('files', 'pdf')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'search',
      'pdf',
    ]);
    expect(Keys.searchCacheKey('files', 'pdf', filter)).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'files',
      'search',
      'pdf',
      filter,
    ]);
    expect(Keys.searchCacheKey('assets', 'pdf')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'search',
      'pdf',
    ]);
    expect(Keys.searchCacheKey('assets', 'pdf', filter)).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'search',
      'pdf',
      filter,
    ]);
  });
  test('infiniteSearchCacheKey', () => {
    expect(Keys.infiniteSearchCacheKey('assets', 'PT')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'search',
      'infinite',
      { query: 'PT' },
      { filter: undefined },
      { config: undefined },
    ]);
    expect(Keys.infiniteSearchCacheKey('assets', 'PT', filter)).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'assets',
      'search',
      'infinite',
      { query: 'PT' },
      { filter },
      { config: undefined },
    ]);

    expect(Keys.infiniteSearchCacheKey('sequences', 'PT')).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'sequences',
      'search',
      'infinite',
      { query: 'PT' },
      { filter: undefined },
      { config: undefined },
    ]);
    expect(Keys.infiniteSearchCacheKey('sequences', 'PT', filter)).toEqual([
      'sdk-react-query-hooks',
      'cdf',
      'sequences',
      'search',
      'infinite',
      { query: 'PT' },
      { filter },
      { config: undefined },
    ]);
  });
});
