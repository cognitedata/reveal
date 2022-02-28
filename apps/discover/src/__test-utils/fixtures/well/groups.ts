import { WellGroupsResponse } from '@cognite/discover-api-types';

export const getWellGroups = (): WellGroupsResponse => {
  return {
    regions: {
      Discover: {},
      Volve: {},
      'Jovian System': {},
    },
    fields: {
      Callisto: { region: 'Jovian System' },
      'Gulf of Mexico': { region: 'Discover' },
      Ganymede: { region: 'Volve' },
    },
    blocks: {
      Achelous: {
        region: 'Volve',
        field: 'Ganymede',
      },
      Adad: {
        region: 'Volve',
        field: 'Ganymede',
      },
      Adal: {
        region: 'Jovian System',
        field: 'Callisto',
      },
      Adapa: {
        region: 'Volve',
        field: 'Ganymede',
      },
      Aegir: {
        region: 'Jovian System',
        field: 'Callisto',
      },
      Agloolik: {
        region: 'Jovian System',
        field: 'Callisto',
      },
      Agreus: {
        region: 'Volve',
        field: 'Ganymede',
      },
      Ägröi: {
        region: 'Jovian System',
        field: 'Callisto',
      },
      Agrotes: {
        region: 'Volve',
        field: 'Ganymede',
      },
    },
  };
};
