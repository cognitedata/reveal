import { UnitConverterItem } from '_helpers/units/interfaces';

export const getNdsUnitChangeAccessors = (
  toUnit: string
): UnitConverterItem[] => [
  {
    id: 'id',
    accessor: 'metadata.md_hole_start',
    fromAccessor: 'metadata.md_hole_start_unit',
    to: toUnit,
  },
  {
    id: 'id',
    accessor: 'metadata.md_hole_end',
    fromAccessor: 'metadata.md_hole_end_unit',
    to: toUnit,
  },
  {
    id: 'id',
    accessor: 'metadata.tvd_offset_hole_start',
    fromAccessor: 'metadata.tvd_offset_hole_start_unit',
    to: toUnit,
  },
  {
    id: 'id',
    accessor: 'metadata.tvd_offset_hole_end',
    fromAccessor: 'metadata.tvd_offset_hole_end_unit',
    to: toUnit,
  },
];
