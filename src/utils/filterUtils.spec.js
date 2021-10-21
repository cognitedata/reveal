import { handleDataSetsFilters } from './filterUtils';

describe('FilterUtils', () => {
  describe('handleDataSetsSearch', () => {
    const dataSets = [
      { id: 123, name: 'my data set', metadata: { archived: false } },
      {
        id: 111,
        name: 'foo',
        metadata: {
          archived: false,
          integrations: [{ name: 'integration', externalId: 'abc123' }],
        },
      },
      {
        id: 333,
        name: 'bar',
        metadata: {
          archived: false,
          integrations: [{ name: 'other thing', externalId: 'external_999' }],
        },
      },
      {
        id: 444,
        name: 'baz',
        metadata: {
          archived: false,
        },
      },
    ];
    test('Searches among integrations name', () => {
      const res = handleDataSetsFilters(
        false,
        'integra',
        jest.fn(),
        'all',
        dataSets
      );
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(dataSets[1]);
    });

    test('Searches among integrations external id', () => {
      const res = handleDataSetsFilters(
        false,
        'external_999',
        jest.fn(),
        'all',
        dataSets
      );
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(dataSets[2]);
    });

    test('Searches on data set name', () => {
      const res = handleDataSetsFilters(
        false,
        'baz',
        jest.fn(),
        'all',
        dataSets
      );
      expect(res.length).toEqual(1);
      expect(res[0].name).toEqual(dataSets[3].name);
    });
  });
});
