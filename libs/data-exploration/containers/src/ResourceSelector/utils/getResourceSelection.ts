import { RowSelectionState, Updater } from '@tanstack/react-table';
import mapValues from 'lodash/mapValues';

import { ResourceItem, ResourceType } from '@data-exploration-lib/core';

import { INITIAL_SELECTED_ROWS, ResourceSelection } from '../ResourceSelector';

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
  if (!item || !selectedRows) {
    return INITIAL_SELECTED_ROWS;
  }

  if (!updater || !currentData || !resourceType) {
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
          return currentData.find((el) => String(el?.id) === key);
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
