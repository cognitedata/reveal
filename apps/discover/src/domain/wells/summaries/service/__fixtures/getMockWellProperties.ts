import { WellPropertiesSummaryRow } from '@cognite/sdk-wells';

import { getMockWellPropertiesSummaryRow } from './getMockWellPropertiesSummaryRow';

const regions = {
  Discover: getMockWellPropertiesSummaryRow({
    region: 'Discover',
  }),
  Volve: getMockWellPropertiesSummaryRow({
    region: 'Volve',
  }),
  'Jovian System': getMockWellPropertiesSummaryRow({
    region: 'Jovian System',
  }),
} as const;

const fields = {
  'Gulf of Mexico': getMockWellPropertiesSummaryRow({
    ...regions.Discover,
    field: 'Gulf of Mexico',
  }),
  Ganymede: getMockWellPropertiesSummaryRow({
    ...regions.Volve,
    field: 'Ganymede',
  }),
  Callisto: getMockWellPropertiesSummaryRow({
    ...regions['Jovian System'],
    field: 'Callisto',
  }),
} as const;

const blocks = {
  Achelous: getMockWellPropertiesSummaryRow({
    ...fields.Ganymede,
    block: 'Achelous',
  }),
  Adad: getMockWellPropertiesSummaryRow({
    ...fields.Ganymede,
    block: 'Adad',
  }),
  Adapa: getMockWellPropertiesSummaryRow({
    ...fields.Ganymede,
    block: 'Adapa',
  }),
  Agreus: getMockWellPropertiesSummaryRow({
    ...fields.Ganymede,
    block: 'Agreus',
  }),
  Agrotes: getMockWellPropertiesSummaryRow({
    ...fields.Ganymede,
    block: 'Agrotes',
  }),
  Adal: getMockWellPropertiesSummaryRow({
    ...fields.Callisto,
    block: 'Adal',
  }),
  Aegir: getMockWellPropertiesSummaryRow({
    ...fields.Callisto,
    block: 'Aegir',
  }),
  Agloolik: getMockWellPropertiesSummaryRow({
    ...fields.Callisto,
    block: 'Agloolik',
  }),
  Agrol: getMockWellPropertiesSummaryRow({
    ...fields.Callisto,
    block: 'Agrol',
  }),
} as const;

export const getMockWellProperties = (): WellPropertiesSummaryRow[] => {
  return [
    ...Object.values(regions),
    ...Object.values(fields),
    ...Object.values(blocks),
  ];
};
