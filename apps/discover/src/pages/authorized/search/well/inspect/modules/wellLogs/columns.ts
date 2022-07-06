import { COMMON_COLUMN_WIDTHS } from '../../constants';

export const columns = [
  {
    Header: 'Well',
    accessor: 'wellName',
    width: COMMON_COLUMN_WIDTHS.WELL_NAME,
    maxWidth: '0.5fr',
  },
  {
    Header: 'Wellbore',
    accessor: 'wellboreName',
    width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
    maxWidth: '0.3fr',
  },
  {
    Header: 'Log Name',
    accessor: 'id',
    width: '140px',
    maxWidth: '0.3fr',
  },
  {
    Header: 'Source',
    accessor: 'source.sourceName',
    width: '140px',
  },
];
