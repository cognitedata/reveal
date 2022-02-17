import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getCasingColumnsWithPrefferedUnit } from '../helper';

export const useGetCasingTableColumns = () => {
  const { data: unit } = useUserPreferencesMeasurement();
  const wellsTableColumns = unit ? getCasingColumnsWithPrefferedUnit(unit) : [];
  const casingsTableColumn = [
    {
      Header: '',
      accessor: 'gap',
      width: '30px',
      Cell: () => <>&nbsp;</>,
    },
    ...wellsTableColumns,
  ];
  return {
    wellsTableColumns,
    casingsTableColumn,
  };
};
