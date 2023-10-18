import { RowSelectionState } from '@tanstack/react-table';

import {
  INITIAL_SELECTED_ROWS,
  ResourceItem,
} from '@data-exploration-lib/core';

import { ResourceSelection } from '../../ResourceSelector';
import { getResourceSelection } from '../getResourceSelection';

describe('getResourceSelection', () => {
  it('should return INITIAL_SELECTED_ROWS', () => {
    const updater = jest.fn();
    expect(
      getResourceSelection({ updater, currentData: [], resourceType: 'asset' })
    ).toStrictEqual(INITIAL_SELECTED_ROWS);
  });

  it('should return with new selection', () => {
    const item: ResourceItem = {
      id: 12345,
      type: 'asset',
    };
    const selectedRows: ResourceSelection = INITIAL_SELECTED_ROWS;
    expect(getResourceSelection({ item, selectedRows })).toStrictEqual({
      ...INITIAL_SELECTED_ROWS,
      asset: {
        [item.id]: item,
      },
    });
  });

  it('should merge selection', () => {
    const item: ResourceItem = {
      id: 12345,
      type: 'asset',
    };
    const selectedRows: ResourceSelection = {
      ...INITIAL_SELECTED_ROWS,
      asset: {
        54321: {
          id: 54321,
          type: 'asset',
        },
      },
    };
    expect(getResourceSelection({ item, selectedRows })).toStrictEqual({
      ...INITIAL_SELECTED_ROWS,
      asset: {
        ...selectedRows.asset,
        [item.id]: item,
      },
    });
  });

  it('should return result with updater', () => {
    const item: ResourceItem = {
      id: 12345,
      type: 'asset',
    };
    const selectedRows: ResourceSelection = {
      ...INITIAL_SELECTED_ROWS,
      asset: {
        0: { id: 0, type: 'asset' },
        1: { id: 1, type: 'asset' },
      },
    };
    const updater = jest.fn((state: RowSelectionState) => state);
    const result = getResourceSelection({
      item,
      selectedRows,
      updater,
      currentData: [{ id: 1, type: 'asset' }],
      resourceType: 'asset',
    });

    expect(updater).toBeCalledWith({ 0: false, 1: true });
    expect(result).toStrictEqual({
      ...INITIAL_SELECTED_ROWS,
      asset: {
        0: { id: 0, type: 'asset' },
        1: { id: 1, type: 'asset' },
      },
    });
  });

  it('should return result when updater is not a function', () => {
    const item: ResourceItem = {
      id: 12345,
      type: 'asset',
    };
    const selectedRows: ResourceSelection = {
      ...INITIAL_SELECTED_ROWS,
      asset: {
        0: { id: 0, type: 'asset' },
        1: { id: 1, type: 'asset' },
      },
    };
    const result = getResourceSelection({
      item,
      selectedRows,
      updater: {
        0: false,
        1: true,
      },
      currentData: [{ id: 1, type: 'asset' }],
      resourceType: 'asset',
    });

    expect(result).toStrictEqual({
      ...INITIAL_SELECTED_ROWS,
      asset: {
        0: undefined,
        1: { id: 1, type: 'asset' },
      },
    });
  });
});
