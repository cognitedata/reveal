import get from 'lodash/get';
import { shortDate } from 'utils/date';

import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';

import { processAccessor } from './utils';

export const getCommonColumns = (unit?: string) => {
  return [
    {
      id: accessors.START_TIME,
      Header: 'Start Date',
      width: '150px',
      accessor: (row: NPTEvent) => {
        const startDate = processAccessor(row, accessors.START_TIME);
        if (startDate) return shortDate(startDate);
        return null;
      },
    },
    {
      id: accessors.END_TIME,
      Header: 'End Date',
      width: '150px',
      accessor: (row: NPTEvent) => {
        const endDate = processAccessor(row, accessors.END_TIME);
        if (endDate) return shortDate(endDate);
        return null;
      },
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
      accessor: (row: NPTEvent) => processAccessor(row, accessors.DURATION),
    },
    {
      id: accessors.NPT_DETAIL_CODE,
      Header: 'NPT Detail Code',
      width: '150px',
      accessor: (row: NPTEvent) =>
        processAccessor(row, accessors.NPT_DETAIL_CODE),
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
      width: '150px',
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
