import { getEndTimeDisplay } from 'domain/wells/npt/internal/selectors/getEndTimeDisplay';
import { getStartTimeDisplay } from 'domain/wells/npt/internal/selectors/getStartTimeDisplay';
import { NptView } from 'domain/wells/npt/internal/types';

import keyBy from 'lodash/keyBy';
import set from 'lodash/set';
import { toFixedNumber } from 'utils/number';
import { processAccessor } from 'utils/table/processAccessor';

import { ColumnType } from 'components/Tablev3';

import { accessors } from '../constants';

export const getCommonColumns = (unit?: string): ColumnType<NptView>[] => {
  return [
    {
      id: accessors.NPT_DETAIL_CODE,
      Header: 'NPT Detail Code',
      width: '150px',
      accessor: (row) => processAccessor(row, 'nptCodeDetail'),
      stickyColumn: true,
    },
    {
      id: accessors.START_TIME,
      Header: 'Start Date',
      width: '150px',
      accessor: getStartTimeDisplay,
      sortType: (rowA, rowB) =>
        processAccessor(rowA.original, 'startTime') -
        processAccessor(rowB.original, 'startTime'),
    },
    {
      id: accessors.END_TIME,
      Header: 'End Date',
      width: '150px',
      accessor: getEndTimeDisplay,
      sortType: (rowA, rowB) =>
        processAccessor(rowA.original, 'endTime') -
        processAccessor(rowB.original, 'endTime'),
    },
    {
      id: accessors.MEASURED_DEPTH,
      Header: `NPT MD${unit ? ` (${unit})` : ''}`,
      width: '150px',
      accessor: (row) => {
        const depth = row.measuredDepth?.value;
        if (depth) return depth.toFixed(0);
        return 'N/A';
      },
    },
    {
      id: accessors.DURATION,
      Header: 'Duration (Hrs)',
      width: '150px',
      accessor: (row) =>
        String(toFixedNumber(processAccessor(row, 'duration'), 2)),
      sortType: (rowA, rowB) =>
        processAccessor(rowA.original, 'duration') -
        processAccessor(rowB.original, 'duration'),
    },
    {
      id: accessors.DESCRIPTION,
      Header: 'Description',
      width: '500px',
      maxWidth: '1fr',
      accessor: (row) => processAccessor(row, 'description'),
      expandableContent: true,
    },
    {
      id: accessors.ROOT_CAUSE,
      Header: 'Root Cause',
      width: '500px',
      accessor: (row) => processAccessor(row, 'rootCause'),
      expandableContent: true,
    },
    {
      id: accessors.LOCATION,
      Header: 'Failure Location',
      width: '150px',
      accessor: (row) => processAccessor(row, 'location'),
    },
    {
      id: accessors.NPT_LEVEL,
      Header: 'NPT Level',
      width: '150px',
      accessor: (row) => processAccessor(row, 'nptLevel'),
    },
    {
      id: accessors.SUBTYPE,
      Header: 'Subtype',
      width: '150px',
      accessor: (row) => processAccessor(row, 'subtype'),
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
  columns: ColumnType<NptView>[],
  mutateColumns: Partial<ColumnType<NptView>>[]
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
