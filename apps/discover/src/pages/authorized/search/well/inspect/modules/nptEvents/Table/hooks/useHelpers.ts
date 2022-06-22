import { getNptCodeTableSort } from 'domain/wells/npt/internal/selectors/getNptCodeSort';

import get from 'lodash/get';
import { getTimeDuration } from 'utils/date';
import { processAccessor } from 'utils/table/processAccessor';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { NPTEvent } from 'modules/wellSearch/types';

import { COMMON_COLUMN_WIDTHS } from '../../../../constants';
import { accessors } from '../../constants';
import { useNptData } from '../../hooks/useNptData';
import { NptView } from '../../types';
import { getCommonColumns, getExtendedColumns } from '../columns';
import {
  renderAsBody2DefaultStrongText,
  renderNPTCodeWithColor,
} from '../utils';

export const useNptTableCommonHeaders = () => {
  const { data: preferredUnit } = useUserPreferencesMeasurement();
  return getCommonColumns(preferredUnit);
};

export const useNptWellsTableColumns = () => {
  return [
    {
      id: accessors.NPT_CODE,
      Header: 'Well / Wellbore / NPT code',
      width: COMMON_COLUMN_WIDTHS.WELL_NAME,
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderAsBody2DefaultStrongText(get(original, accessors.WELL_NAME)),
      stickyColumn: true,
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useNptWellboresTableColumns = () => {
  return [
    {
      id: accessors.WELLBORE_NAME,
      width: '270px',
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderAsBody2DefaultStrongText(get(original, accessors.WELLBORE_NAME)),
      stickyColumn: true,
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useNptEventsTableColumns = () => {
  const { nptCodeDefinitions } = useNptData();

  return [
    {
      id: accessors.NPT_CODE,
      width: '270px',
      maxWidth: '0.3fr',
      Cell: ({ row: { original } }: { row: { original: NptView } }) =>
        renderNPTCodeWithColor(original, nptCodeDefinitions),
      stickyColumn: true,
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useSelectedWellboreNptEventsTableColumns = () => {
  const commonHeaders = useNptTableCommonHeaders();
  const { nptCodeDefinitions } = useNptData();

  return [
    {
      id: accessors.NPT_CODE,
      Header: 'NPT Code',
      width: '150px',
      sortType: getNptCodeTableSort,
      Cell: ({ row: { original } }: { row: { original: NptView } }) =>
        renderNPTCodeWithColor(original, nptCodeDefinitions),
      stickyColumn: true,
    },
    ...getExtendedColumns(commonHeaders, [
      {
        id: accessors.DURATION,
        Header: 'Duration',
        accessor: (row) => {
          const duration = processAccessor(row, 'duration');
          if (duration) return getTimeDuration(duration, 'hours');
          return '';
        },
      },
    ]),
  ];
};
