import { EMPTY_ARRAY } from '../../../utilities/constants';
import { isDefined } from '../../../utilities/isDefined';
import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup
} from '../../../utilities/StylingGroupUtils';
import { type Image360PolygonStylingGroup } from '../../Image360CollectionContainer';
import { type AnnotationIdStylingGroup } from '../../Image360CollectionContainer/useApply360AnnotationStyling';
import { type InstanceStylingGroup } from '../types';

export type Image360StyledGroup = Image360PolygonStylingGroup & {
  assetRefs: number[];
};

export const useCalculateImage360Styling = (
  instanceStyling: InstanceStylingGroup[] | undefined
): AnnotationIdStylingGroup[] => {
  if (instanceStyling === undefined || instanceStyling.length === 0) {
    return EMPTY_ARRAY;
  }

  return instanceStyling
    .map((group) => {
      if (group.style.image360 === undefined) {
        return undefined;
      }

      if (isClassicAssetMappingStylingGroup(group)) {
        return { assetRefs: group.assetIds, style: group.style.image360 };
      }
      if (isFdmAssetStylingGroup(group)) {
        return { assetRefs: group.fdmAssetExternalIds, style: group.style.image360 };
      }
      return undefined;
    })
    .filter(isDefined);
};
