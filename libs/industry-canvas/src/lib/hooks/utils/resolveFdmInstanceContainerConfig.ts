import { v4 as uuid } from 'uuid';

import { CogniteClient } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';

import {
  FdmInstanceContainerReference,
  IndustryCanvasContainerConfig,
} from '../../types';
import {
  DEFAULT_FDM_INSTANCE_HEIGHT,
  DEFAULT_FDM_INSTANCE_WIDTH,
} from '../../utils/addDimensionsToContainerReference';

const resolveFdmInstanceContainerConfig = async (
  _: CogniteClient,
  {
    id,
    instanceExternalId,
    instanceSpace,
    viewExternalId,
    viewSpace,
    viewVersion,
    x,
    y,
    width,
    height,
    label,
  }: FdmInstanceContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  return {
    id: id || uuid(),
    type: ContainerType.FDM_INSTANCE,
    label: label ?? instanceExternalId,
    x: x,
    y: y,
    width: width ?? DEFAULT_FDM_INSTANCE_WIDTH,
    height: height ?? DEFAULT_FDM_INSTANCE_HEIGHT,
    instanceExternalId,
    instanceSpace,
    viewExternalId,
    viewSpace,
    viewVersion,
    metadata: {
      name: `${viewExternalId} - ${instanceExternalId}`,
      externalId: instanceExternalId,
    },
  };
};

export default resolveFdmInstanceContainerConfig;
