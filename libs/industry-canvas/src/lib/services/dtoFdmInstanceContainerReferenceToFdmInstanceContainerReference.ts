import { pickBy } from 'lodash';

import {
  ContainerReferenceType,
  FdmInstanceContainerReference,
} from '../types';

import { DTOFdmInstanceContainerReference } from './types';

export const dtoFdmInstanceContainerReferenceToFdmInstanceContainerReference = (
  dtoContainerReference: DTOFdmInstanceContainerReference
): FdmInstanceContainerReference => {
  const { containerReferenceType, ...commonProps } = dtoContainerReference;
  // Filter out null values from commonProps
  const filteredCommonProps = pickBy(commonProps, (val) => val !== null);

  if (containerReferenceType !== ContainerReferenceType.FDM_INSTANCE) {
    throw new Error(
      `Expected containerReferenceType to be ${ContainerReferenceType.FDM_INSTANCE} got ${containerReferenceType}`
    );
  }
  return {
    ...filteredCommonProps,
    instanceExternalId: commonProps.instanceExternalId,
    instanceSpace: commonProps.instanceSpace,
    viewExternalId: commonProps.viewExternalId,
    viewSpace: commonProps.viewSpace,
    viewVersion:
      commonProps.viewVersion === null || commonProps.viewVersion === undefined
        ? undefined
        : commonProps.viewVersion,
    type: containerReferenceType,
  };
};
