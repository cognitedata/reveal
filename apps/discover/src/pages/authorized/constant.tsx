import { getKbElevation } from 'domain/wells/wellbore/internal/selectors/getKbElevation';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

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
