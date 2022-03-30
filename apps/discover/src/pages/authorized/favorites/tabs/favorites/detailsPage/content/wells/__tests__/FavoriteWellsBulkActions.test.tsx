import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { FavoriteWellsBulkActions, Props } from '../FavoriteWellsBulkActions';

describe('Favorite Bulk action bar', () => {
  afterEach(async () => jest.clearAllMocks());

  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(FavoriteWellsBulkActions, undefined, viewProps);

  const deselectAll = jest.fn();
  const onRemoveWellsAndWellbores = jest.fn();
  const onViewWellbores = jest.fn();

  it('should render the number of wells and wellbores selected', async () => {
    await defaultTestInit({
      selectedWellsAndWellbores: {
        1: ['1', '2', '3'],
      },
      deselectAll,
      onViewWellbores,
      onRemoveWellsAndWellbores,
    });

    expect(screen.getByText('1 well selected')).toBeInTheDocument();
    expect(screen.getByText('With 3 wellbores inside')).toBeInTheDocument();
  });

  it('should call deselectAll on close', async () => {
    await defaultTestInit({
      selectedWellsAndWellbores: {
        1: ['1', '2', '3'],
      },
      deselectAll,
      onViewWellbores,
      onRemoveWellsAndWellbores,
    });

    const closeBtn = screen.queryByTestId('close-btn');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }

    expect(deselectAll).toBeCalledTimes(1);
  });

  it('should call onRemoveWellsAndWellbores when "Remove from set" is clicked', async () => {
    await defaultTestInit({
      selectedWellsAndWellbores: {
        1: ['1', '2', '3'],
      },
      deselectAll,
      onViewWellbores,
      onRemoveWellsAndWellbores,
    });

    await fireEvent.click(screen.getByText('Remove from set'));
    fireEvent.click(screen.getByText('Remove'));

    expect(onRemoveWellsAndWellbores).toBeCalledTimes(1);
  });

  it('should call onViewWellbores when "View" button is clicked', async () => {
    await defaultTestInit({
      selectedWellsAndWellbores: {
        1: ['1', '2', '3'],
      },
      deselectAll,
      onViewWellbores,
      onRemoveWellsAndWellbores,
    });

    await fireEvent.click(screen.getByText('View'));

    expect(onViewWellbores).toBeCalledTimes(1);
  });
});
