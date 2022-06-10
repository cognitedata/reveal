import { getKbElevation } from 'domain/wells/wellbore/internal/selectors/getKbElevation';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';
import { KB_ELEVATION_TEXT } from 'modules/wellSearch/constantsSidebarFilters';

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

export const getWellboreColumns = (
  userPreferredUnit?: string
): ColumnMap<Wellbore> => {
  return {
    wellbore: {
      Header: WELLBORE,
      accessor: (row) => row?.name || row?.description || '',
      width: '250px',
      maxWidth: '1fr',
    },
    kbElevation: {
      Header: KB_ELEVATION_TEXT,
      accessor: (wellbore) => getKbElevation(wellbore, userPreferredUnit),
      width: '130px',
    },
  };
};
