import { SearchHistoryResponse } from '@cognite/discover-api-types';

export const getMockSearchHistory: () => SearchHistoryResponse[] = () => [
  {
    lastUpdatedTime: '2021-08-19T10:50:50.093Z',
    name: 'current',
    sortBy: {
      documents: [],
    },
    query: '',
    createdTime: '2021-08-19T10:50:50.048Z',
    filters: {
      documents: {
        facets: {
          filetype: ['PDF', 'IMAGE'],
          lastmodified: [],
          lastcreated: [],
          location: ['SOURCE_1'],
        },
      },
      wells: {
        // '7': [58, 7058],
        // '8': ['2020-02-29T18:30:00.000Z', '2020-03-24T18:30:00.000Z'],
      },
    },
    geoJson: [],
    id: 'a8881c62-a409-4e08-b2f5-1c532423dd00',
  },
  {
    lastUpdatedTime: '2021-08-18T08:34:27.517Z',
    name: 'current',
    sortBy: {
      documents: [],
    },
    query: 'DC 113 Daily Summary.pdf_00',
    createdTime: '2021-08-18T08:34:27.472Z',
    filters: {
      documents: {
        facets: {
          filetype: [],
          lastmodified: [],
          lastcreated: [],
          location: [],
        },
      },
      wells: {},
    },
    geoJson: [],
    id: 'a58b9040-f518-49b8-800d-0182be3b0193',
  },
];
