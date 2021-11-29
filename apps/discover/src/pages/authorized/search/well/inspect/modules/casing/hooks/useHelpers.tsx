import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getCasingColumnsWithPrefferedUnit } from '../helper';

export const useGetCasingTableColumns = () => {
  const wellsTableColumns = getCasingColumnsWithPrefferedUnit(
    useUserPreferencesMeasurement()
  );
  const casingsTableColumn = [
    {
      Header: '',
      accessor: 'gap',
      width: '30px',
      Cell: () => <>&nbsp;</>,
    },
    ...wellsTableColumns.map((row) =>
      row.accessor === 'wellName' ? { ...row, accessor: 'wellboreName' } : row
    ),
  ];
  return {
    wellsTableColumns,
    casingsTableColumn,
  };
};
