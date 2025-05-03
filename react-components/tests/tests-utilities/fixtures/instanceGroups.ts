import { Color } from "three";
import { AssetStylingGroup, FdmAssetStylingGroup, HybridFdmAssetStylingGroup } from "../../../src";

export const mockInstanceGroups: Array<
    FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup
  > = [
    {
      fdmAssetExternalIds: [
        {
          externalId: 'externalId1',
          space: 'space1'
        }
      ],
      style: {
        cad: { color: new Color('red') }
      }
    },
    {
      assetIds: [1, 2],
      style: {
        cad: { color: new Color('red') }
      }
    },
    {
      hybridFdmAssetExternalIds: [
        {
          externalId: 'externalId2',
          space: 'space2'
        }
      ],
      style: {
        cad: { color: new Color('red') }
      }
    }
  ];
