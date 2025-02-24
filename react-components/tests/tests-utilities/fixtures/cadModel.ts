import { CogniteCadModel } from '@cognite/reveal';
import { It, Mock } from 'moq.ts';
import { Box3, Matrix4, Vector3 } from 'three';

export const cadModelOptions = {
  modelId: 123,
  revisionId: 456
};

export const nodeBoundingBox = new Box3(new Vector3(1, 1, 1), new Vector3(2, 2, 2));

export const cadMock = createCadMock();

export function createCadMock(): CogniteCadModel {
  return new Mock<CogniteCadModel>()
    .setup((p) => p.modelId)
    .returns(cadModelOptions.modelId)
    .setup((p) => p.revisionId)
    .returns(cadModelOptions.revisionId)
    .setup((p) => p.getModelTransformation())
    .returns(new Matrix4())
    .setup(async (p) => await p.getBoundingBoxesByNodeIds(It.IsAny()))
    .returns(Promise.resolve([nodeBoundingBox]))
    .prototypeof(CogniteCadModel.prototype)
    .object();
}
