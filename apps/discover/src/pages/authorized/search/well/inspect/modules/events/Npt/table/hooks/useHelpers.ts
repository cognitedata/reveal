import get from 'lodash/get';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';
import { NPTEvent } from 'modules/wellSearch/types';

import { COMMON_COLUMN_WIDTHS } from '../../../../../constants';
import { accessors } from '../../constants';
import { getCommonColumns } from '../columns';
import {
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
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderAsBody2DefaultStrongText(get(original, accessors.WELLBORE_NAME)),
    },
    ...useNptTableCommonHeaders(),
  ];
};

export const useNptEventsTableColumns = (withHeader = false) => {
  return [
    {
      id: accessors.NPT_CODE,
      Header: withHeader && 'NPT code',
      Cell: ({ row: { original } }: { row: { original: NPTEvent } }) =>
        renderNPTCodeWithColor(original),
    },
    ...useNptTableCommonHeaders(),
  ];
};
