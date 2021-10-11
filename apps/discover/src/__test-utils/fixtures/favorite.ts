import uniqueId from 'lodash/uniqueId';

import { defaultTestUser } from '__test-utils/testdata.utils';
import { FavoriteSummary, FavoriteDocumentData } from 'modules/favorite/types';

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
    wellIds: [],
  },
  description: 'mock favorite description',
  name: 'Mock favorite',
  createdTime: '2020-01-14T12:46:05.133Z',
  lastUpdatedTime: '2020-02-14T12:46:05.133Z',
  lastUpdatedBy: [],
  assetCount: 0,
  sharedWith: [],
  ...extras,
});

export const getMockFavoriteDocumentData = (
  extras?: Partial<FavoriteDocumentData>
): FavoriteDocumentData => ({
  id: 12345,
  name: '',
  ...extras,
});
