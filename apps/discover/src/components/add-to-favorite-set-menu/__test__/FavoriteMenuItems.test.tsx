import { fireEvent, screen } from '@testing-library/react';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { testRenderer } from '__test-utils/renderer';

import { FavoriteMenuItems, Props } from '../FavoriteMenuItems';

describe('FavoriteMenuItems', () => {
  const favoriteSets = [getMockFavoriteSummary()];
  const handleSelectFavorite = jest.fn();

  const defaultProps: Props = { favoriteSets, handleSelectFavorite };

  const defaultTestInit = async (viewProps: Props = defaultProps) =>
    testRenderer(FavoriteMenuItems, undefined, viewProps);

  it('should render menu items as expected', async () => {
    await defaultTestInit();

    expect(screen.getAllByText('Mock favorite').length).toEqual(1);
  });

  it('should render menu items alphabetically', async () => {
    await defaultTestInit();

    expect(screen.getAllByText('Mock favorite').length).toEqual(1);
  });

  it('should call `handleSelectFavorite` as expected', async () => {
    const favoriteSet = favoriteSets[0];
    await defaultTestInit();
    const favoriteListItem = screen.getAllByText('Mock favorite')[0];

    expect(favoriteListItem).toHaveTextContent(favoriteSet.name);

    fireEvent.click(favoriteListItem);
    expect(handleSelectFavorite).toBeCalledTimes(1);
  });
});
