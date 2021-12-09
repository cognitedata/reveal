import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
// import { COGS_ICON_CLASS_PREFIX } from 'components/buttons';

import { ADD_TO_FAVOURITES, CREATE_NEW_SET } from '../constants';
import { FavoriteBase, Props } from '../FavoriteBase';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('../../../modules/api/favorites/useFavoritesQuery', () => ({
  useFavoritesSortedByName: () => ({
    status: true,
    favorites: [],
  }),
  useFavoriteUpdateContent: jest.fn,
}));

jest.mock('../FavoriteMenuItems', () => ({
  FavoriteMenuItems: () => <div>Favorite Menu</div>,
}));

describe('Favorite base', () => {
  const defaultTestInit = async (viewProps?: Props) =>
    testRenderer(FavoriteBase, undefined, viewProps);

  it(`should display header`, async () => {
    await defaultTestInit({
      documentIds: [1],
      wellIds: [1],
      callBackModal: jest.fn,
    });
    expect(screen.getByText(ADD_TO_FAVOURITES)).toBeInTheDocument();
    expect(screen.getByText(CREATE_NEW_SET)).toBeInTheDocument();
    // expect(
    //   container.getElementsByClassName(`${COGS_ICON_CLASS_PREFIX}-Add`)
    //     .length
    // ).toBeGreaterThan(0);

    expect(screen.getByText('Favorite Menu')).toBeInTheDocument();
  });

  it(`should not display header`, async () => {
    await defaultTestInit({
      documentIds: [1],
      wellIds: [1],
    });
    expect(screen.queryByText(ADD_TO_FAVOURITES)).not.toBeInTheDocument();
  });

  it(`should not show menu divider`, async () => {
    await defaultTestInit({
      documentIds: [1],
      wellIds: [1],
    });
    expect(screen.queryByTestId('menu-divider')).not.toBeInTheDocument();
  });

  it(`should click create favorite`, async () => {
    const callbackFunc = jest.fn();
    await defaultTestInit({
      documentIds: [1],
      wellIds: [1],
      callBackModal: callbackFunc,
    });

    fireEvent.click(screen.getByText(CREATE_NEW_SET));
    expect(callbackFunc).toBeCalled();
    expect(callbackFunc).toBeCalledTimes(1);
  });
});
