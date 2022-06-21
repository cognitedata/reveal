import { getSpudDateDisplay } from 'domain/wells/well/internal/selectors/getSpudDateDisplay';
import { getSpudDateTableSort } from 'domain/wells/well/internal/selectors/getSpudDateSort';
import { wellFieldTitles } from 'domain/wells/well/internal/titles';
import { Well } from 'domain/wells/well/internal/types';
import { DogLegSeverityUnit } from 'domain/wells/wellbore/internal/types';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';
import {
  DOGLEG_SEVERITY,
  MD_ELEVATION_TEXT,
  TVD,
  KB_ELEVATION_TEXT,
} from 'modules/wellSearch/constantsSidebarFilters';

import {
  BLOCK_NAME,
  FIELD_NAME,
  OPERATOR,
  SOURCE,
  WATER_DEPTH,
  WELL,
} from './content/constants';

export type Field = {
  enabled: boolean;
};

export const getWellColumns = (
  userPreferredUnit = '',
  doglegUnit?: DogLegSeverityUnit
): ColumnMap<Well> => {
  return {
    wellname: {
      Header: WELL,
      accessor: 'name',
      width: '250px',
      maxWidth: '0.6fr',
      Cell: (cell) => <MiddleEllipsis value={cell.row.original.name} />,
      order: 0,
      stickyColumn: true,
    },
    source: {
      Header: SOURCE,
      accessor: 'sourceList',
      width: '150px',
      order: 6,
    },
    operator: {
      Header: OPERATOR,
      accessor: 'operator',
      width: '150px',
      maxWidth: '0.4fr',
      order: 2,
    },
    spudDate: {
      Header: wellFieldTitles.spudDate,
      accessor: getSpudDateDisplay,
      sortType: getSpudDateTableSort,
      width: '140px',
      order: 3,
    },
    waterDepth: {
      Header: `${WATER_DEPTH} (${userPreferredUnit})`,
      accessor: 'waterDepth.value',
      width: '170px',
      order: 4,
    },
    blockname: {
      Header: BLOCK_NAME,
      accessor: 'block',
      width: '150px',
      order: 5,
    },
    fieldname: {
      Header: FIELD_NAME,
      accessor: 'field',
      width: '150px',
      order: 1,
    },
    kbElevation: {
      Header: `${KB_ELEVATION_TEXT} (${userPreferredUnit})`,
      accessor: 'kbElevation', // this is an empty cell in well table
      width: '130px',
      order: 7,
    },
    trueVerticalDepth: {
      Header: `${TVD} (${userPreferredUnit})`,
      accessor: 'tvd',
      width: '130px',
      order: 8,
    },
    measuredDepth: {
      Header: `${MD_ELEVATION_TEXT} (${userPreferredUnit})`,
      accessor: 'md',
      width: '130px',
      order: 9,
    },
    doglegSeverity: {
      Header: doglegUnit
        ? `${DOGLEG_SEVERITY} (${doglegUnit.angleUnit}/${doglegUnit.distanceInterval} ${doglegUnit.distanceUnit}s)`
        : `${DOGLEG_SEVERITY}`,
      accessor: 'dls',
      width: '130px',
      order: 10,
    },
  };
};
