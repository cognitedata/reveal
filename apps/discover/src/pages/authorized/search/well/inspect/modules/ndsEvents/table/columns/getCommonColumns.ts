import { NDS_ACCESSORS } from 'domain/wells/nds/internal/selectors/accessors';
import { getProbabilityTableSort } from 'domain/wells/nds/internal/selectors/getProbabilitySort';
import { getSeverityTableSort } from 'domain/wells/nds/internal/selectors/getSeveritySort';

import { ColumnType } from 'components/Tablev3';
import { UserPreferredUnit } from 'constants/units';

import { ValueLabel } from '../../../common/Table/ValueLabel';
import { NdsView } from '../../types';

export const getCommonColumns = (
  unit: UserPreferredUnit
): ColumnType<NdsView>[] => {
  return [
    {
      Header: 'Risk Type',
      accessor: NDS_ACCESSORS.RISK_TYPE,
      width: '160px',
      maxWidth: 'auto',
    },
    {
      Header: 'Severity',
      id: NDS_ACCESSORS.SEVERITY,
      Cell: ({ row }) => ValueLabel(row.original.severity),
      width: '140px',
      sortType: getSeverityTableSort,
    },
    {
      Header: 'Probability',
      id: NDS_ACCESSORS.PROBABILITY,
      Cell: ({ row }) => ValueLabel(row.original.probability),
      width: '140px',
      sortType: getProbabilityTableSort,
    },
    {
      Header: 'Subtype',
      accessor: NDS_ACCESSORS.SUBTYPE,
      width: '200px',
    },
    {
      Header: `Diameter hole (${unit})`,
      accessor: NDS_ACCESSORS.DIAMETER_HOLE,
      width: '140px',
    },
    {
      Header: `MD hole start (${unit})`,
      accessor: NDS_ACCESSORS.MD_HOLE_START,
      width: '140px',
    },
    {
      Header: `MD hole end (${unit})`,
      accessor: NDS_ACCESSORS.MD_HOLE_END,
      width: '140px',
    },
    {
      Header: `TVD offset hole start (${unit})`,
      accessor: NDS_ACCESSORS.TVD_HOLE_START,
      width: '160px',
    },
    {
      Header: `TVD offset hole end (${unit})`,
      accessor: NDS_ACCESSORS.TVD_HOLE_END,
      width: '160px',
    },
  ];
};
