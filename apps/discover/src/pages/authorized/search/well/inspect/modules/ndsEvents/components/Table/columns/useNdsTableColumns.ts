import { NDS_ACCESSORS } from 'domain/wells/nds/internal/selectors/accessors';
import { getWellNameTableSort } from 'domain/wells/well/internal/selectors/getWellNameSort';

import { useMemo } from 'react';

import { ColumnType } from 'components/Tablev3';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { Body2DefaultStrong } from '../../../../common/Table/Body2DefaultStrong';
import { NdsView } from '../../../types';

import { getCommonColumns } from './getCommonColumns';

export const useNdsTableCommonColumns = (): ColumnType<NdsView>[] => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  return useMemo(
    () => getCommonColumns(userPreferredUnit),
    [userPreferredUnit]
  );
};

export const useNdsWellsTableColumns = (): ColumnType<NdsView>[] => {
  return [
    {
      id: NDS_ACCESSORS.WELLBORE_NAME,
      Header: 'Well / Wellbore',
      width: '300px',
      maxWidth: 'auto',
      Cell: ({ row }) => Body2DefaultStrong(row.original.wellName),
      sortType: getWellNameTableSort,
      stickyColumn: true,
    },
    ...useNdsTableCommonColumns(),
  ];
};

export const useNdsWellboresTableColumns = (): ColumnType<NdsView>[] => {
  return [
    {
      id: NDS_ACCESSORS.WELLBORE_NAME,
      Header: 'Wellbore',
      width: '300px',
      maxWidth: 'auto',
      Cell: ({ row }) => Body2DefaultStrong(row.original.wellboreName),
      stickyColumn: true,
    },
    ...useNdsTableCommonColumns(),
  ];
};
