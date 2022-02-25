import uniqueId from 'lodash/uniqueId';

import { defaultTestUser } from '__test-utils/testdata.utils';
import { FavoriteSummary } from 'modules/favorite/types';

export const getMockFavoriteSummary = (
  extras?: Partial<FavoriteSummary>
): FavoriteSummary => ({
  id: uniqueId(),
  owner: {
    id: defaultTestUser,
  },
  content: {
    documentIds: [],
    seismicIds: [],
    wells: {},
  },
  description: 'mock favorite description',
  name: 'Mock favorite',
  createdTime: '2020-01-14T12:46:05.133Z',
  lastUpdatedTime: '2020-02-14T12:46:05.133Z',
  lastUpdatedBy: [
    {
      userId: defaultTestUser,
      dateTime: '2020-02-14T12:46:05.133Z',
    },
  ],
  assetCount: 0,
  sharedWith: [],
  ...extras,
});

export const getMockFavoritesList = (numberOfItems = 10): FavoriteSummary[] => {
  return [...Array(numberOfItems).keys()].map((index) => {
    const date = new Date('2020-02-14T12:46:05.133Z');
    date.setDate(date.getDate() + index);
    return getMockFavoriteSummary({
      createdTime: date.toISOString(),
      lastUpdatedTime: date.toISOString(),
      lastUpdatedBy: [
        {
          userId: defaultTestUser,
          dateTime: date.toISOString(),
        },
      ],
    });
  });
};
