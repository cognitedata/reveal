import { DistanceUnitEnum, TrueVerticalDepths } from '@cognite/sdk-wells-v3';

import { ResponseItemType } from '../types';

export const getEmptyTvd = (
  responseItems: ResponseItemType[]
): TrueVerticalDepths[] => {
  return responseItems.map((item) => ({
    trueVerticalDepths: [],
    measuredDepths: [],
    trueVerticalDepthUnit: {
      unit: DistanceUnitEnum.Meter,
    },
    sequenceSource: {
      sequenceExternalId: '',
      sourceName: '',
    },
    wellboreAssetExternalId: item.wellboreAssetExternalId,
    wellboreMatchingId: item.wellboreMatchingId,
  }));
};
