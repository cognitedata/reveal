import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { FAVORITE_ON_ICON } from 'pages/authorized/search/map/constants';

import { AddSingleItem } from '../AddSingleItem';
import { Props } from '../FavoriteBase';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('Favorite base', () => {
  const defaultTestInit = async (viewProps?: Props) =>
    testRenderer(AddSingleItem, undefined, viewProps);

  it(`should not show icon`, async () => {
    await defaultTestInit({
      documentIds: [],
      wellIds: [],
    });

    const favoriteOnIcon = screen.queryByTitle(FAVORITE_ON_ICON);
    expect(favoriteOnIcon).not.toBeInTheDocument();
  });
});
