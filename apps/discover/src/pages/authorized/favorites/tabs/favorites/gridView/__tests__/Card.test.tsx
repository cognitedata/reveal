import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { FavoriteSummary } from 'modules/favorite/types';

import FavouriteCard, { Props } from '../Card';

describe('Favorite Card', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavouriteCard, undefined, viewProps);

  it('should render the card', async () => {
    const favorite: FavoriteSummary = {
      createdTime: '2021-06-08T15:00:11.161Z',
      assetCount: 1,
      content: { documentIds: [], wells: {}, seismicIds: [] },
      id: '12',
      name: 'test',
      description: 'test-desc',
      lastUpdatedBy: [],
      lastUpdatedTime: '',
      owner: { id: 'test' },
      sharedWith: [],
    };
    await defaultTestInit({
      favorite,
      onClick: jest.fn(),
      handleOpenModal: jest.fn(),
      isFavoriteSetOwner: true,
      setCommentTarget: jest.fn(),
    });

    const cardContainer = screen.queryByTestId('favorite-card-test');
    expect(cardContainer).toBeInTheDocument();

    const cardDesc = screen.getByDisplayValue('test-desc');
    expect(cardDesc).toBeInTheDocument();
  });
});
