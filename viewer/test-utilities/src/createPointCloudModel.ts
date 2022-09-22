/*!
 * Copyright 2021 Cognite AS
 */

import { Mock } from 'moq.ts';
import { CognitePointCloudModel, PointCloudNode, PotreeGroupWrapper, PotreeNodeWrapper } from '../../packages/pointclouds';

export function createPointCloudModel(
  modelId: number,
  revisionId: number
): CognitePointCloudModel {
  const groupWrapperMock = new Mock<PotreeGroupWrapper>();
  const nodeWrapperMock = new Mock<PotreeNodeWrapper>();

  const pointCloudNode = new PointCloudNode(groupWrapperMock.object(),
                                            nodeWrapperMock.object(),
                                            undefined);
  const model = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);

  return model;
}
