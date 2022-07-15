import { CasingSchematicInternal } from '../types';

import { getMockCasingAssemblyInternal } from './getMockCasingAssemblyInternal';

export const getMockCasingSchematicInternal = (
  extras?: Partial<CasingSchematicInternal>
): CasingSchematicInternal => {
  return {
    wellboreAssetExternalId: 'wells/ophiuchus/well-OPH28907094/wellbores/wb-01',
    wellboreMatchingId: 'wells/ophiuchus/well-OPH28907094/wellbores/wb-01',
    casingAssemblies: [getMockCasingAssemblyInternal()],
    source: {
      sourceName: 'ophiuchus',
      sequenceExternalId: 'ophiuchus:casing:000:s:0:0',
    },
    phase: 'ACTUAL',
    ...extras,
  };
};
