import { getDiameterHole } from 'domain/wells/nds/internal/selectors/getDiameterHole';

import {
  COMMON_COLUMN_ACCESSORS,
  COMMON_COLUMN_WIDTHS,
} from 'pages/authorized/search/well/inspect/constants';
import {
  accessors,
  widths,
} from 'pages/authorized/search/well/inspect/modules/events/constants';

export const getNdsEventTableColumns = (unit?: string) => [
  {
    Header: 'Well',
    accessor: COMMON_COLUMN_ACCESSORS.WELL_NAME,
    width: COMMON_COLUMN_WIDTHS.WELL_NAME,
    maxWidth: '0.5fr',
  },
  {
    Header: 'Wellbore',
    accessor: COMMON_COLUMN_ACCESSORS.WELLBORE_NAME,
    width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
    maxWidth: '0.5fr',
  },
  {
    Header: 'Risk Type',
    accessor: accessors.RISK_TYPE,
    width: '140px',
  },
  {
    Header: 'Severity',
    accessor: accessors.SEVERITY,
    width: '140px',
  },
  {
    Header: 'Probability',
    accessor: accessors.PROBABILITY,
    width: '140px',
  },
  {
    Header: 'Risk Subtype',
    accessor: accessors.RISK_SUB_CATEGORY,
    width: widths.RISK_SUB_CATEGORY,
  },
  {
    Header: 'Diameter Hole (in)',
    accessor: getDiameterHole,
    width: '140px',
  },
  {
    Header: `MD Hole Start${unit ? ` (${unit})` : ''}`,
    accessor: accessors.MD_HOLE_START,
    width: '140px',
  },
  {
    Header: `MD Hole End${unit ? ` (${unit})` : ''}`,
    accessor: accessors.MD_HOLE_END,
    width: '140px',
  },
  {
    Header: `TVD Offset Hole Start${unit ? ` (${unit})` : ''}`,
    accessor: accessors.TVD_OFFSET_HOLE_START,
    width: '140px',
  },
  {
    Header: `TVD Offset Hole End${unit ? ` (${unit})` : ''}`,
    accessor: accessors.TVD_OFFSET_HOLE_END,
    width: '140px',
  },
];
