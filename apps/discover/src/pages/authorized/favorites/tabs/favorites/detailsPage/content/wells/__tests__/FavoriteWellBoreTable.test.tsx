import { fireEvent, screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { useWellboresByIdsAndWellId } from 'modules/wellSearch/selectors';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { LOADING_TEXT } from 'pages/authorized/search/well/content/constants';

import { FavoriteWellboreTable, Props } from '../FavoriteWellBoreTable';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well.ts', () => ({
  useWellBoreResult: jest.fn(),
  useWells: jest.fn(),
}));

jest.mock('modules/wellSearch/selectors', () => ({
  useWellboresByIdsAndWellId: jest.fn(),
}));

describe('Favorite Wellbore table', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellboreTable, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  it('should render the loader', async () => {
    (useWellboresByIdsAndWellId as jest.Mock).mockImplementation(() => []);

    await defaultTestInit({
      well: {
        id: 1,
        name: 'well',
        sourceAssets: jest.fn(),
      },
      wellboreIds: ['test 1'],
      removeWell: jest.fn(),
      setWellboreIds: jest.fn(),
      selectedWellbores: ['test 1'],
      favoriteContentWells: { '1': ['test 1', 'test 2'] },
      favoriteId: '',
    });

    const emptyState = screen.getByText(LOADING_TEXT);

    expect(emptyState).toBeInTheDocument();
  });

  it('should render table correctly', async () => {
    (useWellboresByIdsAndWellId as jest.Mock).mockImplementation(() => [
      {
        id: 'test-id',
        description: 'test wellbore',
        name: 'test wellbore',
      },
    ]);

    await defaultTestInit({
      well: {
        id: 1,
        name: 'well',
        sourceAssets: jest.fn(),
      },
      wellboreIds: [],
      removeWell: jest.fn(),
      setWellboreIds: jest.fn(),
      selectedWellbores: [],
      favoriteContentWells: {},
      favoriteId: '',
    });

    expect(screen.getByText('test wellbore')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
  });

  it('should render wellbore `Remove from set` button', async () => {
    (useWellboresByIdsAndWellId as jest.Mock).mockImplementation(() => [
      {
        id: 'test-id-1',
        description: 'test wellbore',
        name: 'test wellbore',
      },
    ]);
    const removeWell = jest.fn();

    await defaultTestInit({
      well: {
        id: 1,
        name: 'well',
        sourceAssets: jest.fn(),
      },
      wellboreIds: [],
      removeWell,
      setWellboreIds: jest.fn(),
      selectedWellbores: [],
      favoriteContentWells: { '1': ['test-id-1'] },
      favoriteId: '',
    });

    fireEvent.mouseEnter(screen.getByTestId('menu-button'), { bubbles: true });
    expect(await screen.findByText(REMOVE_FROM_SET_TEXT)).toBeInTheDocument();
  });
});
