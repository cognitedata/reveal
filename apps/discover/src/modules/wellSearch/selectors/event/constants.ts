import { UnitConverterItem } from '_helpers/units/interfaces';
import { FEET } from 'constants/units';

export const ndsAccessorsToFixedDecimal = [
  'metadata.md_hole_start',
  'metadata.md_hole_end',
];

export const ndsUnitChangeAcceessors: UnitConverterItem[] = [
  {
    id: 'id',
    accessor: 'metadata.md_hole_start',
    fromAccessor: 'metadata.md_hole_start_unit',
    to: FEET,
  },
  {
    id: 'id',
    accessor: 'metadata.md_hole_end',
    fromAccessor: 'metadata.md_hole_end_unit',
    to: FEET,
  },
];
