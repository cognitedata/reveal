import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { fireEvent, screen } from '@testing-library/react';
import { getElementById } from 'utils/general.helper';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { NO_WELLBORES_FOUND } from 'pages/authorized/search/well/content/constants';

import { FavoriteWellboreTable, Props } from '../FavoriteWellBoreTable';

const wellbores = [
  getMockWellbore({ id: 'wellboreId1', name: 'test wellbore' }),
];
const selectedWellboreIds = ['wellboreId1'];
const onViewWellbores = jest.fn();
const onSelectedWellbore = jest.fn();
const onRemoveWellbores = jest.fn();

describe('Favorite Wellbore table', () => {
  const defaultTestInit = (
    viewProps?: Omit<
      Props,
      'onRemoveWellbores' | 'onViewWellbores' | 'onSelectedWellbore'
    >
  ) =>
    testRendererModal(FavoriteWellboreTable, getMockedStore(), {
      onViewWellbores,
      onSelectedWellbore,
      onRemoveWellbores,
      ...viewProps,
    });

  afterEach(async () => jest.clearAllMocks());

  it('should render the empty state when there are no wellbores', async () => {
    await defaultTestInit({
      wellbores: [],
      selectedWellboreIds: [],
    });

    const emptyState = screen.getByText(NO_WELLBORES_FOUND);

    expect(emptyState).toBeInTheDocument();
  });

  it('should render table and selection correctly', async () => {
    await defaultTestInit({
      wellbores,
      selectedWellboreIds,
    });

    expect(screen.getByTitle('test wellbore')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  it('should call correct parent functions', async () => {
    await defaultTestInit({
      wellbores,
      selectedWellboreIds,
    });

    fireEvent.mouseEnter(screen.getByTestId('menu-button'), { bubbles: true });
    fireEvent.click(screen.getByText(REMOVE_FROM_SET_TEXT));
    fireEvent.click(screen.getByText('Remove'));
    expect(onRemoveWellbores).toHaveBeenCalledWith(['wellboreId1']);

    fireEvent.click(screen.getByText('View'));
    expect(onViewWellbores).toHaveBeenCalledWith(['wellboreId1']);
    const checkbox = getElementById('Toggle Row Selected');
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(onSelectedWellbore).toHaveBeenCalled();
  });
});
