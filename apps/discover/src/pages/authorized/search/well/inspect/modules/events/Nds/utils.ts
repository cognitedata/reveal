import {
  COMMON_COLUMN_ACCESSORS,
  COMMON_COLUMN_WIDTHS,
} from 'pages/authorized/search/well/inspect/constants';
import {
  accessors,
  widths,
} from 'pages/authorized/search/well/inspect/modules/events/constants';

export const getNdsEventTableColumns = (unit: string) => [
  {
    Header: 'Well',
    accessor: COMMON_COLUMN_ACCESSORS.WELL_NAME,
    width: COMMON_COLUMN_WIDTHS.WELL_NAME,
  },
  {
    Header: 'Wellbore',
    accessor: COMMON_COLUMN_ACCESSORS.WELLBORE_NAME,
    width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
  },
  {
    Header: 'Risk Type',
    accessor: accessors.RISK_TYPE,
  },
  {
    Header: 'Severity',
    accessor: accessors.SEVERITY,
  },
  {
    Header: 'Probability',
    accessor: accessors.PROBABILITY,
  },
  {
    Header: 'Risk Subtype',
    accessor: accessors.RISK_SUB_CATEGORY,
    width: widths.RISK_SUB_CATEGORY,
  },
  {
    Header: 'Diameter Hole (in)',
    accessor: accessors.DIAMETER_HOLE,
  },
  {
    Header: `MD Hole Start (${unit})`,
    accessor: accessors.MD_HOLE_START,
  },
  {
    Header: `MD Hole End (${unit})`,
    accessor: accessors.MD_HOLE_END,
  },
  {
    Header: `TVD Offset Hole Start (${unit})`,
    accessor: accessors.TVD_OFFSET_HOLE_START,
  },
  {
    Header: `TVD Offset Hole End (${unit})`,
    accessor: accessors.TVD_OFFSET_HOLE_END,
  },
];
