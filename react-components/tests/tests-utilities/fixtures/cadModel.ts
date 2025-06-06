import { AddModelOptions, CogniteCadModel } from '@cognite/reveal';
import { It, Mock } from 'moq.ts';
import { Box3, Matrix4, Vector3 } from 'three';
import { TaggedAddCadResourceOptions } from '../../../src/components/Reveal3DResources/types';

export const cadModelOptions: AddModelOptions = {
  modelId: 123,
  revisionId: 456
};

export const taggedCadModelOptions: TaggedAddCadResourceOptions = {
  type: 'cad',
  addOptions: cadModelOptions
};

export const nodeBoundingBox = new Box3(new Vector3(1, 1, 1), new Vector3(2, 2, 2));

export const cadMock = createCadMock();

export function createCadMock(parameters?: { visible?: boolean }): CogniteCadModel {
  return new Mock<CogniteCadModel>()
    .setup((p) => p.modelId)
    .returns(cadModelOptions.modelId)
    .setup((p) => p.revisionId)
    .returns(cadModelOptions.revisionId)
    .setup((p) => p.getModelTransformation())
    .returns(new Matrix4())
    .setup(async (p) => await p.getBoundingBoxesByNodeIds(It.IsAny()))
    .returns(Promise.resolve([nodeBoundingBox]))
    .setup((p) => p.visible)
    .returns(parameters?.visible ?? true)
    .setup((p) => p.type)
    .returns('cad')
    .prototypeof(CogniteCadModel.prototype)
    .object();
}
