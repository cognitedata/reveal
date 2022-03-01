import { getSpudDateDisplay } from 'dataLayers/wells/wells/selectors/getSpudDateDisplay';
import { getSpudDateTableSort } from 'dataLayers/wells/wells/selectors/getSpudDateSort';
import { wellFieldTitles } from 'dataLayers/wells/wells/titles';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { Well } from 'modules/wellSearch/types';

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

export const getWellColumns = (userPreferredUnit = ''): ColumnMap<Well> => {
  return {
    wellname: {
      Header: WELL,
      accessor: 'name',
      width: '250px',
      maxWidth: '0.6fr',
      Cell: (cell) => <MiddleEllipsis value={cell.row.original.name} />,
      order: 0,
    },
    source: {
      Header: SOURCE,
      accessor: (value: Well) =>
        value.sources ? value.sources.join(', ') : '',
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
  };
};
