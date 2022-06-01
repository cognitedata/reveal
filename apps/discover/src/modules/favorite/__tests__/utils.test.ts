import { getMockFavoriteSummary } from 'domain/favorites/service/__fixtures/favorite';

import { FavoriteSummary } from '../types';
import {
  getDocumentIds,
  getWellIds,
  getWellbores,
  getDocumentExistInFavorite,
  getWellsToAddAfterFavoriteCreation,
  getUpdatedWells,
  getDocumentsToAddAfterFavoriteCreation,
} from '../utils';

describe('Util functions', () => {
  const favorites: FavoriteSummary[] = [
    {
      ...getMockFavoriteSummary(),
      id: 'favoriteIdOne',
      content: {
        documentIds: [6851377442822181, 1831170469163203, 5974419898633335],
        wells: {
          '365b6041': [],
          '4d8d5dae7': ['e8fe4fe'],
          '35f456c8': ['8ae14b59'],
        },
        seismicIds: [],
      },
    },
    {
      ...getMockFavoriteSummary(),
      id: 'favoriteIdTwo',
      content: {
        documentIds: [],
        wells: {
          '308f0eb7': [],
          '4d8d5dae7': [],
        },
        seismicIds: [],
      },
    },
  ];

  it(`should get well id list`, async () => {
    const wells = getWellIds('123');
    expect(wells).toEqual(['123']);

    const emptyWells = getWellIds();
    expect(emptyWells).toEqual([]);
  });

  it(`should get document id list`, async () => {
    const documents = getDocumentIds(123);
    expect(documents).toEqual([123]);

    const emptyDocuments = getDocumentIds();
    expect(emptyDocuments).toEqual([]);
  });

  it('should get wellbore id list', () => {
    const wellboreIds = getWellbores('test-id');
    expect(wellboreIds).toEqual(['test-id']);

    const emptyWellboreIds = getWellbores('');
    expect(emptyWellboreIds).toEqual([]);
  });

  it('should return expected values with inputs in `getDocumentExistInFavorite` function', () => {
    const favoriteIds = getDocumentExistInFavorite(favorites, 6851377442822181);
    expect(favoriteIds).toEqual(['favoriteIdOne']);

    const emptyFavoriteIds = getDocumentExistInFavorite(favorites, 1234);
    expect(emptyFavoriteIds).toEqual([]);
  });

  it('should return expected values with inputs in `getWellsToAddAfterFavoriteCreation` function', () => {
    const favoriteContentWells = getWellsToAddAfterFavoriteCreation([
      '1',
      '2',
      '3',
    ]);
    expect(Object.keys(favoriteContentWells)).toEqual(
      expect.arrayContaining(['1', '2', '3'])
    );

    const emptyFavoriteContentWells = getWellsToAddAfterFavoriteCreation([]);
    expect(emptyFavoriteContentWells).toEqual({});
  });

  it('should return expected values with inputs in `getUpdatedWells` function', () => {
    const favoriteSetWithExistingWellId = getUpdatedWells(
      favorites,
      ['4d8d5dae7'],
      ['one', 'two'],
      'favoriteIdOne'
    );
    expect(Object.keys(favoriteSetWithExistingWellId)).toEqual(
      expect.arrayContaining(['4d8d5dae7'])
    );
    expect(favoriteSetWithExistingWellId['4d8d5dae7']).toEqual(
      expect.arrayContaining(['one', 'two'])
    );

    const favoriteSetWithNewWellId = getUpdatedWells(
      favorites,
      ['5fs5fea2'],
      ['one', 'two'],
      'favoriteIdTwo'
    );

    expect(Object.keys(favoriteSetWithNewWellId)).toEqual(
      expect.arrayContaining(['5fs5fea2'])
    );
    expect(favoriteSetWithNewWellId['5fs5fea2']).toEqual(
      expect.arrayContaining(['one', 'two'])
    );

    const favoriteSetWithNewWellWithAllWellbores = getUpdatedWells(
      favorites,
      ['newWellId'],
      [],
      'favoriteIdTwo'
    );
    expect(Object.keys(favoriteSetWithNewWellWithAllWellbores)).toEqual(
      expect.arrayContaining(['newWellId'])
    );

    const undefinedFavoriteContentWells = getUpdatedWells(
      [],
      ['newWellId'],
      [],
      'favoriteIdTwo'
    );
    expect(undefinedFavoriteContentWells).toEqual(undefined);
  });

  it('should return expected values with inputs in `getDocumentsToAddAfterFavoriteCreation` function', () => {
    const undefinedDucumentIds = getDocumentsToAddAfterFavoriteCreation([]);
    expect(undefinedDucumentIds).toEqual(undefined);

    const documentIds = getDocumentsToAddAfterFavoriteCreation([1, 2, 3]);
    expect(documentIds).toEqual([1, 2, 3]);
  });
});
