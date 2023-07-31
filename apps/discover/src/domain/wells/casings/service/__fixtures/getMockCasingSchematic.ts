import { CasingSchematic } from '@cognite/sdk-wells';

import { getMockCasingAssembly } from './getMockCasingAssembly';

export const getMockCasingSchematic = (
  extras?: Partial<CasingSchematic>
): CasingSchematic => {
  return {
    wellboreAssetExternalId: 'wells/ophiuchus/well-OPH28907094/wellbores/wb-01',
    wellboreMatchingId: 'wells/ophiuchus/well-OPH28907094/wellbores/wb-01',
    casingAssemblies: [getMockCasingAssembly()],
    source: {
      sourceName: 'ophiuchus',
      sequenceExternalId: 'ophiuchus:casing:000:s:0:0',
    },
    phase: 'ACTUAL',
    ...extras,
  };
};
