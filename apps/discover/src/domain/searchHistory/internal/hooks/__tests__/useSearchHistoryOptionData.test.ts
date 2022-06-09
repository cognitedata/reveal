import { getMockSearchHistory } from 'domain/searchHistory/service/__fixtures/searchHistory';

import { renderHook } from '@testing-library/react-hooks';

import { useSearchHistoryListQuery } from '../../queries/useSearchHistoryQuery';
import { useSearchHistoryOptionData } from '../useSearchHistoryOptionData';

jest.mock(
  'domain/searchHistory/internal/queries/useSearchHistoryQuery',
  () => ({
    useSearchHistoryListQuery: jest.fn(),
  })
);

describe('useSearchHistoryOptionData hook', () => {
  const getSearchHistoryOptionData = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSearchHistoryOptionData()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return an empty array when search history list query is undefined', () => {
    (useSearchHistoryListQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    const searchHistoryOptionData = getSearchHistoryOptionData();
    expect(searchHistoryOptionData).toEqual([]);
  });

  it('should return search history option data as expected', () => {
    (useSearchHistoryListQuery as jest.Mock).mockImplementation(() => ({
      data: getMockSearchHistory(),
    }));

    const searchHistoryOptionData = getSearchHistoryOptionData();
    expect(searchHistoryOptionData).toEqual([
      {
        data: { filters: {} },
        label: 'Search History',
        options: [
          {
            data: {
              createdTime: '2021-08-18T08:34:27.472Z',
              filters: {
                documents: {
                  facets: {
                    fileCategory: [],
                    lastcreated: [],
                    lastmodified: [],
                    location: [],
                  },
                },
                wells: {},
              },
              geoJson: [],
              id: 'a58b9040-f518-49b8-800d-0182be3b0193',
              lastUpdatedTime: '2021-08-18T08:34:27.517Z',
              name: 'current',
              query: 'DC 113 Daily Summary.pdf_00',
              sortBy: { documents: [] },
            },
            label: 'DC 113 Daily Summary.pdf_00',
            value: 'DC 113 Daily Summary.pdf_00',
          },
        ],
      },
    ]);
  });
});
