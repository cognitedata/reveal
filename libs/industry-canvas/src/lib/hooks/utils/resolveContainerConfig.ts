import { CogniteClient } from '@cognite/sdk';

import {
  ContainerReference,
  IndustryCanvasContainerConfig,
  isAssetContainerReference,
  isEventContainerReference,
  isFileContainerReference,
  isThreeDContainerReference,
  isTimeseriesContainerReference,
  isFdmInstanceContainerReference,
} from '../../types';
import assertNever from '../../utils/assertNever';

import resolveAssetContainerConfig from './resolveAssetContainerConfig';
import resolveEventContainerConfig from './resolveEventContainerConfig';
import resolveFdmInstanceContainerConfig from './resolveFdmInstanceContainerConfig';
import resolveFileContainerConfig from './resolveFileContainerConfig';
import resolveRevealContainerConfig from './resolveRevealContainerConfig';
import resolveTimeseriesContainerConfig from './resolveTimeseriesContainerConfig';

const resolveContainerConfig = async (
  sdk: CogniteClient,
  containerReference: ContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  if (isFileContainerReference(containerReference)) {
    return resolveFileContainerConfig(sdk, containerReference);
  }

  if (isTimeseriesContainerReference(containerReference)) {
    return resolveTimeseriesContainerConfig(sdk, containerReference);
  }

  if (isAssetContainerReference(containerReference)) {
    return resolveAssetContainerConfig(sdk, containerReference);
  }

  if (isEventContainerReference(containerReference)) {
    return resolveEventContainerConfig(sdk, containerReference);
  }

  if (isThreeDContainerReference(containerReference)) {
    return resolveRevealContainerConfig(sdk, containerReference);
  }

  if (isFdmInstanceContainerReference(containerReference)) {
    return resolveFdmInstanceContainerConfig(sdk, containerReference);
  }

  assertNever(containerReference, 'Unsupported container reference type');
};

export default resolveContainerConfig;
