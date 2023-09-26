import { omit } from 'lodash';

import {
  AssetCentricContainerReference,
  ContainerReferenceType,
} from '../../types';
import { getAnnotationOrContainerExternalId } from '../dataModelUtils';
import { DTOAssetCentricContainerReference } from '../types';

const getResourceIds = (
  ref: AssetCentricContainerReference
): Pick<DTOAssetCentricContainerReference, 'resourceId' | 'resourceSubId'> => {
  if (ref.type === ContainerReferenceType.THREE_D) {
    return {
      resourceId: ref.modelId,
      resourceSubId: ref.revisionId,
    };
  }
  return {
    resourceId: ref.resourceId,
  };
};

export const getDTOAssetCentricContainerReferences = (
  containerReferences: AssetCentricContainerReference[],
  canvasExternalId: string,
  zIndexById: Record<string, number | undefined>
): DTOAssetCentricContainerReference[] => {
  return containerReferences.map((containerReference) => {
    const {
      id,
      type,
      label,
      x,
      y,
      width,
      height,
      maxWidth,
      maxHeight,
      ...props
    } = containerReference;
    if (id === undefined) {
      throw new Error(
        'The containerReference id cannot be undefined when upserting to FDM'
      );
    }
    return {
      externalId: getAnnotationOrContainerExternalId(id, canvasExternalId),
      id,
      containerReferenceType: type,
      label,
      x,
      y,
      width,
      height,
      maxWidth,
      maxHeight,
      ...getResourceIds(containerReference),
      properties: {
        ...omit(props, ['resourceId', 'modelId', 'revisionId']),
        zIndex: zIndexById[id],
      } as DTOAssetCentricContainerReference['properties'],
    };
  });
};
