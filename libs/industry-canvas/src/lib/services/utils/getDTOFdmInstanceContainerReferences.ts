import { omit } from 'lodash';

import { FdmInstanceContainerReference } from '../../types';
import { getAnnotationOrContainerExternalId } from '../dataModelUtils';
import { DTOFdmInstanceContainerReference } from '../types';

export const getDTOFdmInstanceContainerReferences = (
  containerReferences: FdmInstanceContainerReference[],
  canvasExternalId: string,
  zIndexById: Record<string, number | undefined>
): DTOFdmInstanceContainerReference[] => {
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
      instanceExternalId: props.instanceExternalId,
      instanceSpace: props.instanceSpace,
      viewExternalId: props.viewExternalId,
      viewSpace: props.viewSpace,
      viewVersion: props.viewVersion,
      properties: {
        ...omit(props, [
          'instanceExternalId',
          'instanceSpace',
          'viewExternalId',
          'viewSpace',
          'viewVersion',
        ]),
        zIndex: zIndexById[id],
      } as DTOFdmInstanceContainerReference['properties'],
    };
  });
};
