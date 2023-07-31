import { ExternalIdTypeEnum, RigOperation } from '@cognite/sdk-wells';

export const getMockRigOperation = (
  extras?: Partial<RigOperation>
): RigOperation => {
  return {
    wellboreAssetExternalId: 'wells/ophiuchus/well-OPH28907094/wellbores/wb-01',
    wellboreMatchingId: 'wells/ophiuchus/well-OPH28907094/wellbores/wb-01',
    source: {
      sourceName: 'ophiuchus',
      externalId: 'ophiuchus:rig-operation:000:s:0:0',
      type: ExternalIdTypeEnum.Event,
    },
    rigName: 'STONEHAM 18',
    ...extras,
  };
};
