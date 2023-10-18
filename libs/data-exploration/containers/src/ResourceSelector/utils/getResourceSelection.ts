import { RowSelectionState, Updater } from '@tanstack/react-table';
import mapValues from 'lodash/mapValues';

import {
  INITIAL_SELECTED_ROWS,
  ResourceItem,
  ResourceType,
} from '@data-exploration-lib/core';

import { ResourceSelection } from '../ResourceSelector';

export const getResourceSelection = ({
  item,
  selectedRows,
  updater,
  currentData,
  resourceType,
}: {
  item?: ResourceItem;
  selectedRows?: ResourceSelection;
  updater?: Updater<RowSelectionState>;
  currentData?: ResourceItem[];
  resourceType?: ResourceType;
}): ResourceSelection => {
  if (!selectedRows) {
    return INITIAL_SELECTED_ROWS;
  }

  if (!updater || !currentData || !resourceType) {
    if (!item) {
      return INITIAL_SELECTED_ROWS;
    }

    return {
      ...selectedRows,
      [item.type]: {
        ...selectedRows[item.type],
        [item.id]: item,
      },
    };
  }

  if (typeof updater === 'function') {
    return {
      ...selectedRows,
      [resourceType]: mapValues(
        updater(
          mapValues(selectedRows[resourceType], (resourceItem) => {
            return Boolean(resourceItem?.id);
          })
        ),
        (_, key) => {
          return (
            currentData.find((el) => String(el?.id) === key) ||
            selectedRows[resourceType][key]
          );
        }
      ),
    };
  }
  return {
    ...selectedRows,
    [resourceType]: mapValues(updater, function (_, key) {
      return currentData.find((el) => String(el?.id) === key);
    }),
  };
};
