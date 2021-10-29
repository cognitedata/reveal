import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { initialState } from 'modules/wellSearch/reducer';
import { useFavoriteWellResults, useWells } from 'modules/wellSearch/selectors';
import { FAVORITE_SET_NO_WELLS } from 'pages/authorized/favorites/constants';

import { FavoriteWellsTable, Props } from '../FavoriteWellTable';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well.ts', () => ({
  useFavoriteWellResults: jest.fn(),
  useWells: jest.fn(),
}));

describe('Favorite Wellbore table', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellsTable, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  it('should render the no well message', async () => {
    (useFavoriteWellResults as jest.Mock).mockImplementation(() => ({
      data: [],
      isLoading: true,
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    await defaultTestInit({
      wells: {},
      removeWell: jest.fn(),
      favoriteId: '1',
    });

    screen.queryByText(FAVORITE_SET_NO_WELLS);
  });
});
