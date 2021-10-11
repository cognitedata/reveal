import { fireEvent, screen } from '@testing-library/react';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { testRenderer } from '__test-utils/renderer';

import { FavoriteMenuItems, Props } from '../FavoriteMenuItems';

describe('FavoriteMenuItems', () => {
  const favouriteSets = [getMockFavoriteSummary()];
  const handleSelectFavourite = jest.fn();

  const defaultProps: Props = { favouriteSets, handleSelectFavourite };

  const defaultTestInit = async (viewProps: Props = defaultProps) =>
    testRenderer(FavoriteMenuItems, undefined, viewProps);

  it('should render menu items as expected', async () => {
    await defaultTestInit();

    expect(screen.getAllByText('Mock favorite').length).toEqual(1);
  });

  it('should call `handleSelectFavourite` as expected', async () => {
    const favouriteSet = favouriteSets[0];
    await defaultTestInit();
    const favouriteListItem = screen.getAllByText('Mock favorite')[0];

    expect(favouriteListItem).toHaveTextContent(favouriteSet.name);

    fireEvent.click(favouriteListItem);
    expect(handleSelectFavourite).toBeCalledTimes(1);
  });
});
