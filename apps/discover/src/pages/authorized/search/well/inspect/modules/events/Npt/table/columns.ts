import { Row } from 'react-table';

import { getEndTimeDisplay } from 'dataLayers/wells/npt/decorators/getEndTimeDisplay';
import { getStartTimeDisplay } from 'dataLayers/wells/npt/decorators/getStartTimeDisplay';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import set from 'lodash/set';
import { toFixedNumber } from 'utils/number';
import { processAccessor } from 'utils/table/processAccessor';

import { ColumnType } from 'components/tablev3';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';

export const getCommonColumns = (unit?: string): ColumnType<NPTEvent>[] => {
  return [
    {
      id: accessors.NPT_DETAIL_CODE,
      Header: 'NPT Detail Code',
      width: '150px',
      accessor: (row: NPTEvent) =>
        processAccessor(row, accessors.NPT_DETAIL_CODE),
      stickyColumn: true,
    },
    {
      id: accessors.START_TIME,
      Header: 'Start Date',
      width: '150px',
      accessor: getStartTimeDisplay,
      sortType: (rowA: Row<NPTEvent>, rowB: Row<NPTEvent>) =>
        processAccessor(rowA.original, accessors.START_TIME) -
        processAccessor(rowB.original, accessors.START_TIME),
    },
    {
      id: accessors.END_TIME,
      Header: 'End Date',
      width: '150px',
      accessor: getEndTimeDisplay,
      sortType: (rowA: Row<NPTEvent>, rowB: Row<NPTEvent>) =>
        processAccessor(rowA.original, accessors.END_TIME) -
        processAccessor(rowB.original, accessors.END_TIME),
    },
    {
      id: accessors.MEASURED_DEPTH,
      Header: `NPT MD${unit ? ` (${unit})` : ''}`,
      width: '150px',
      accessor: (row: NPTEvent) => {
        const depth = get(row, accessors.MEASURED_DEPTH);
        if (depth) return depth.toFixed(0);
        return null;
      },
    },
    {
      id: accessors.DURATION,
      Header: 'Duration (Hrs)',
      width: '150px',
      accessor: (row: NPTEvent) =>
        String(toFixedNumber(processAccessor(row, accessors.DURATION), 2)),
      sortType: (rowA: Row<NPTEvent>, rowB: Row<NPTEvent>) =>
        processAccessor(rowA.original, accessors.DURATION) -
        processAccessor(rowB.original, accessors.DURATION),
    },
    {
      id: accessors.DESCRIPTION,
      Header: 'Description',
      width: '500px',
      maxWidth: '1fr',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.DESCRIPTION),
      displayFullText: true,
    },
    {
      id: accessors.ROOT_CAUSE,
      Header: 'Root Cause',
      width: '500px',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.ROOT_CAUSE),
    },
    {
      id: accessors.LOCATION,
      Header: 'Failure Location',
      width: '150px',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.LOCATION),
    },
    {
      id: accessors.NPT_LEVEL,
      Header: 'NPT Level',
      width: '150px',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.NPT_LEVEL),
    },
    {
      id: accessors.SUBTYPE,
      Header: 'Subtype',
      width: '150px',
      accessor: (row: NPTEvent) => processAccessor(row, accessors.SUBTYPE),
    },
  ];
};

/**
 * This function is to extend the column options.
 * The content of `mutateColumns` is added and the content of `columns` is extended.
 *
 * NOTE: This function is supposed to extend only the existing columns.
 */
export const getExtendedColumns = (
  columns: ColumnType<NPTEvent>[],
  mutateColumns: Partial<ColumnType<NPTEvent>>[]
) => {
  const keyedColumns = keyBy(columns, 'id');
  const keyedMutateColumns = keyBy(mutateColumns, 'id');

  Object.keys(keyedMutateColumns).forEach((id) => {
    const column = keyedColumns[id];

    if (!column) return;

    set(keyedColumns, id, {
      ...column,
      ...keyedMutateColumns[id],
    });
  });

  return Object.values(keyedColumns);
};
