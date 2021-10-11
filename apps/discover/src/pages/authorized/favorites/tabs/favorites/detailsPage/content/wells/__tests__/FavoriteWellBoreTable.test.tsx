import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { initialState } from 'modules/wellSearch/reducer';
import { useWellBoreResult, useWells } from 'modules/wellSearch/selectors';
import { LOADING_TEXT } from 'pages/authorized/search/well/content/constants';

import { FavoriteWellboreTable, Props } from '../FavoriteWellBoreTable';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well.ts', () => ({
  useWellBoreResult: jest.fn(),
  useWells: jest.fn(),
}));

describe('Favorite Wellbore table', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellboreTable, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  it('should render the loader', async () => {
    (useWellBoreResult as jest.Mock).mockImplementation(() => ({
      data: [],
    }));
    (useWells as jest.Mock).mockImplementation(() => ({
      ...initialState,
    }));

    await defaultTestInit({
      well: {
        id: 12,
        name: 'well',
        sourceAssets: jest.fn(),
      },
    });

    const emptyState = screen.queryByText(LOADING_TEXT);

    expect(emptyState).toBeInTheDocument();
  });
});
