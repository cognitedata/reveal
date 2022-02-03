import get from 'lodash/get';
import { getTimeDuration } from 'utils/date';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { NPTEvent } from 'modules/wellSearch/types';

import { COMMON_COLUMN_WIDTHS } from '../../../../../constants';
import { accessors } from '../../constants';
import { getCommonColumns } from '../columns';
import {
  processAccessor,
  renderAsBody2DefaultStrongText,
  renderNPTCodeWithColor,
} from '../utils';

export const useNptTableCommonHeaders = () =>
  getCommonColumns(useUserPreferencesMeasurement());

export const useNptWellsTableColumns = () => {
  return [
    {
      id: accessors.NPT_CODE,
      Header: 'Well / Wellbore / NPT code',
      width: COMMON_COLUMN_WIDTHS.WELL_NAME,
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderAsBody2DefaultStrongText(get(original, accessors.WELL_NAME)),
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useNptWellboresTableColumns = () => {
  return [
    {
      id: accessors.WELLBORE_NAME,
      width: '300px',
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderAsBody2DefaultStrongText(get(original, accessors.WELLBORE_NAME)),
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useNptEventsTableColumns = () => {
  return [
    {
      id: accessors.NPT_CODE,
      width: '330px',
      maxWidth: '0.3fr',
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderNPTCodeWithColor(original),
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useSelectedWellboreNptEventsTableColumns = () => {
  return [
    {
      id: accessors.NPT_CODE,
      Header: 'NPT Code',
      width: '330px',
      maxWidth: '0.3fr',
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderNPTCodeWithColor(original),
    },
    ...useNptTableCommonHeaders().map((header) => {
      if (header.id !== accessors.DURATION) return header;

      // Modifying the `Duration` column.
      return {
        ...header,
        Header: 'Duration',
        width: '330px',
        maxWidth: '0.3fr',
        accessor: (row: NPTEvent) => {
          const duration = processAccessor(row, accessors.DURATION);
          if (duration) return getTimeDuration(duration, 'hours');
          return null;
        },
      };
    }),
  ];
};
