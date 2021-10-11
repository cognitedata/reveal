import { screen } from '@testing-library/react';
import { Store } from 'redux';
// import noop from 'lodash/noop';
// import { fireEvent, waitFor, screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
// import { defaultTestUser } from '__test-utils/testdata.utils';
// import { useFirebaseObject } from 'hooks/useFirebase';
import { initialState as favouriteState } from 'modules/favorite/reducer';
import { FavouriteState } from 'modules/favorite/types';
// import * as favouriteActions from 'modules/favourite/actions';
// import { DELETE_FAVORITE_MODAL_TEXT } from '../../../modals/constants';

import { FavoriteContent, Props } from '../FavoriteContent';
// import { FAVORITE_LIST_CONTAINER } from '../../../constants';

jest.mock('modules/resultPanel/selectors', () => ({
  useActivePanel: jest.fn(),
}));

describe('Favorite Content', () => {
  const getPage = (
    viewStore: Store,
    viewProps: Props = { setCommentTarget: jest.fn() }
  ) =>
    testRendererModal(FavoriteContent, viewStore, viewProps, {
      baseElement: document.body,
    });

  afterEach(async () => jest.clearAllMocks());

  const defaultTestInit = async (
    extra: Partial<FavouriteState> = favouriteState
  ) => {
    const state = {
      ...favouriteState,
      ...extra,
    };
    const store = getMockedStore({ favourite: { ...state } });

    return {
      ...getPage(store),
      store,
    };
  };

  // const getDefaultFavouriteSet = (isLoaded: boolean) => {
  //   return {
  //     status: 'ok',
  //     favorites: [
  //       {
  //         lastUpdatedTime: '2021-03-10T09:33:33.082Z',
  //         name: 'Test set',
  //         description: 'Test description',
  //         createdTime: '2021-03-10T09:33:32.728Z',
  //         lastActivityDate: '2021-03-10T09:33:31.890Z',
  //         owner: defaultTestUser,
  //         favoriteContent: {},
  //         members: [],
  //       },
  //     ],
  //   };
  // };

  // const getFirebaseMockImplementation = (key: String, isLoaded: boolean) => {
  //   if (key.includes('mine')) {
  //     if (key.endsWith('mine')) {
  //       return {
  //         '-Mfdskjhfds': getDefaultFavouriteSet(isLoaded),
  //       };
  //     }
  //     return getDefaultFavouriteSet(isLoaded);
  //   }
  //   return null;
  // };

  // -it('should render a table with favorite sets when viewMode = Row', async () => {
  //   (useFirebaseObject as any).mockImplementation((key: string) =>
  //     getFirebaseMockImplementation(key, true)
  //   );

  //   const { findAllByTestId } = await defaultTestInit({ viewMode: 'Row' });

  //   const table = await findAllByTestId(FAVORITE_LIST_CONTAINER);

  //   expect(table).toHaveLength(1);
  // });

  it('should render the loader when status = loading', async () => {
    await defaultTestInit();

    const emptyState = await screen.findByAltText('Illustration of favorites');

    expect(emptyState).toBeInTheDocument();
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  // it('Simulated: handleDeleteLibrary', async () => {
  //   (useFirebaseObject as any).mockImplementation((key: string) =>
  //     getFirebaseMockImplementation(key)
  //   );
  //   const spy = jest
  //     .spyOn(favouriteActions, 'removeFavouriteSet')
  //     .mockImplementation(() => noop);

  //   // const { getByTestId, getByText, findByText } = await defaultTestInit();
  //   // await waitFor(() => findByText('Test set'));

  //   fireEvent.click(screen.getByTestId('favorite-set-action-delete'));
  //   expect(screen.getByText(DELETE_FAVORITE_MODAL_TEXT)).toBeDefined();
  //   fireEvent.click(screen.getByText('Delete set'));

  //   expect(spy).toBeCalled();
  //   expect(spy).toBeCalledWith(
  //     expect.objectContaining({
  //       id: '-Mfdskjhfds',
  //       owner: defaultTestUser,
  //     })
  //   );
  // });
});
