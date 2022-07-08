import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { NOT_AVAILABLE } from 'constants/empty';
import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';
import {
  DOGLEG_SEVERITY,
  MD_ELEVATION_TEXT,
  TVD,
  KB_ELEVATION_TEXT,
} from 'modules/wellSearch/constantsSidebarFilters';

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
): ColumnMap<WellboreInternal> => {
  return {
    wellbore: {
      Header: WELLBORE,
      accessor: (row) => row?.name || row?.description || '',
      width: '250px',
      maxWidth: '1fr',
      stickyColumn: true,
    },

    /*
     * Following five columns were added for convert wellbore column to sticky.
     * without these columns, wellbore column acquire space of these columns,
     * and then unable see properly other values(KB,TVD,MD,DLS) in wellbore table.
     * So aligned the wellbore table columns with the well table.
     * Note: always should keep the same column name with the well columns.
     */
    fieldname: {
      Header: 'dummyColumn',
      accessor: 'field',
      width: '150px',
    },
    operator: {
      Header: 'dummyColumn',
      accessor: 'operator',
      width: '150px',
    },
    spudDate: {
      Header: 'dummyColumn',
      accessor: 'spud-date',
      width: '140px',
    },
    waterDepth: {
      Header: 'dummyColumn',
      accessor: 'waterDepth.value',
      width: '170px',
    },
    source: {
      Header: 'dummyColumn',
      accessor: 'sourceList',
      width: '150px',
    },
    kbElevation: {
      Header: KB_ELEVATION_TEXT,
      accessor: (wellbore) => String(wellbore.datum?.value || NOT_AVAILABLE),
      width: '130px',
    },
    trueVerticalDepth: {
      Header: `${TVD} (${userPreferredUnit})`,
      accessor: (wellbore) =>
        String(wellbore.maxTrueVerticalDepth || NOT_AVAILABLE),
      width: '130px',
      order: 8,
    },
    measuredDepth: {
      Header: `${MD_ELEVATION_TEXT} (${userPreferredUnit})`,
      accessor: (wellbore) =>
        String(wellbore.maxMeasuredDepth || NOT_AVAILABLE),
      width: '130px',
      order: 9,
    },
    doglegSeverity: {
      Header: `${DOGLEG_SEVERITY} (${userPreferredUnit})`,
      accessor: (wellbore) =>
        String(wellbore.maxDoglegSeverity?.value || NOT_AVAILABLE),
      width: '130px',
      order: 10,
    },
  };
};
