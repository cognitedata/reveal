import { renderHook } from '@testing-library/react-hooks/dom';
import { useHandleFilters } from './filterUtils';

describe('FilterUtils', () => {
  describe('handleDataSetsSearch', () => {
    const { result } = renderHook(() => useHandleFilters());
    const dataSetsWithExtpipes = [
      {
        extpipes: [],
        dataSet: {
          id: 123,
          name: 'my data set',
          metadata: { archived: false },
        },
      },
      {
        extpipes: [{ name: 'extpipe', externalId: 'abc123' }],
        dataSet: {
          id: 111,
          name: 'foo',
          metadata: {
            archived: false,
          },
        },
      },
      {
        extpipes: [{ name: 'other thing', externalId: 'external_999' }],
        dataSet: {
          id: 333,
          name: 'bar',
          metadata: {
            archived: false,
          },
        },
      },
      {
        extpipes: [],
        dataSet: {
          id: 444,
          name: 'baz',
          metadata: {
            archived: false,
          },
        },
      },
    ];
    test('Searches among extpipes name', () => {
      const res = result.current.handleDataSetsFilters(
        false,
        'extpi',
        jest.fn(),
        'all',
        dataSetsWithExtpipes
      );
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(dataSetsWithExtpipes[1]);
    });

    test('Searches among extpipes external id', () => {
      const res = result.current.handleDataSetsFilters(
        false,
        'external_999',
        jest.fn(),
        'all',
        dataSetsWithExtpipes
      );
      expect(res.length).toEqual(1);
      expect(res[0]).toEqual(dataSetsWithExtpipes[2]);
    });

    test('Searches on data set name', () => {
      const res = result.current.handleDataSetsFilters(
        false,
        'baz',
        jest.fn(),
        'all',
        dataSetsWithExtpipes
      );
      expect(res.length).toEqual(1);
      expect(res[0].name).toEqual(dataSetsWithExtpipes[3].name);
    });
  });
});
