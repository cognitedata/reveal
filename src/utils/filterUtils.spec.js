import { handleDataSetsFilters } from './filterUtils';

describe('FilterUtils', () => {
  describe('handleDataSetsSearch', () => {
    const dataSetsWithIntegrations = [
      {
        integrations: [],
        dataSet: {
          id: 123,
          name: 'my data set',
          metadata: { archived: false },
        },
      },
      {
        integrations: [{ name: 'integration', externalId: 'abc123' }],
        dataSet: {
          id: 111,
          name: 'foo',
          metadata: {
            archived: false,
          },
        },
      },
      {
        integrations: [{ name: 'other thing', externalId: 'external_999' }],
        dataSet: {
          id: 333,
          name: 'bar',
          metadata: {
            archived: false,
          },
        },
      },
      {
        integrations: [],
        dataSet: {
          id: 444,
          name: 'baz',
          metadata: {
            archived: false,
          },
        },
      },
    ];
    test('Searches among integrations name', () => {
      const res = handleDataSetsFilters(
        false,
        'integra',
        jest.fn(),
        'all',
        dataSetsWithIntegrations
      );
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(dataSetsWithIntegrations[1]);
    });

    test('Searches among integrations external id', () => {
      const res = handleDataSetsFilters(
        false,
        'external_999',
        jest.fn(),
        'all',
        dataSetsWithIntegrations
      );
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(dataSetsWithIntegrations[2]);
    });

    test('Searches on data set name', () => {
      const res = handleDataSetsFilters(
        false,
        'baz',
        jest.fn(),
        'all',
        dataSetsWithIntegrations
      );
      expect(res.length).toEqual(1);
      expect(res[0].name).toEqual(dataSetsWithIntegrations[3].name);
    });
  });
});
