import { useState } from 'react';

import { TableProps } from '@cognite/cogs.js';

import { getLocalStorageObjectByKey } from '@data-exploration-lib/core';

import { SerializedCanvasDocument } from '../types';

const TABLE_STATE_KEY = 'COGNITE_INDUSTRY_CANVAS_TABLE_STATE';

type TableState = TableProps<SerializedCanvasDocument>['initialState'];

export type UseTableStateReturnType = {
  initialTableState: TableProps<SerializedCanvasDocument>['initialState'];
  onTableStateChange: TableProps<SerializedCanvasDocument>['onStateChange'];
};

const useTableState = () => {
  const [initialTableState] = useState<TableState | undefined>(
    getLocalStorageObjectByKey<TableState>(TABLE_STATE_KEY)
  );

  const onTableStateChange = (changedTableState: TableState) => {
    localStorage.setItem(TABLE_STATE_KEY, JSON.stringify(changedTableState));
  };

  return {
    initialTableState,
    onTableStateChange,
  };
};

export default useTableState;
