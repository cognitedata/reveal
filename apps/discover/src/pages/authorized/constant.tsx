import { getKbElevation } from 'dataLayers/wells/wellbores/selectors/getKbElevation';

import { ColumnType } from 'components/tablev3/types';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { KB_ELEVATION_TEXT } from 'modules/wellSearch/constantsSidebarFilters';
import { Wellbore } from 'modules/wellSearch/types';

import { WELLBORE } from './search/well/content/constants';

export const WellResultTableOptions = {
  expandable: true,
  checkable: true,
  flex: false,
  hideScrollbars: true,
  pagination: {
    enabled: true,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  rowOptions: {
    hoveredStyle: 'var(--cogs-greyscale-grey1)',
  },
};

export const WellboreSubtableOptions = {
  checkable: true,
  hideScrollbars: true,
  hideBorders: true,
  indentRow: true,
  disableSorting: true,
  flex: false,
  rowOptions: {
    hoveredStyle: 'var(--cogs-greyscale-grey1)',
  },
};

export const WellboreColumns = (
  userPreferredUnit?: string
): ColumnType<Wellbore>[] => {
  return [
    {
      Header: WELLBORE,
      accessor: (row) => row?.name || row?.description || '',
      width: '250px',
      maxWidth: '1fr',
    },
    {
      Header: KB_ELEVATION_TEXT,
      accessor: (wellbore) => getKbElevation(wellbore, userPreferredUnit),
      width: '100px',
    },
  ];
};
