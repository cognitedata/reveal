import { type AddModelOptions, CogniteCadModel } from '@cognite/reveal';
import { It, Mock } from 'moq.ts';
import { Box3, Matrix4, Vector3 } from 'three';
import { type TaggedAddCadResourceOptions } from '../../../src/components/Reveal3DResources/types';

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

export function createCadMock(parameters?: {
  visible?: boolean;
  modelId?: number;
  revisionId?: number;
}): CogniteCadModel {
  const cad = new Mock<CogniteCadModel>()
    .setup((p) => p.modelId)
    .returns(parameters?.modelId ?? cadModelOptions.modelId)
    .setup((p) => p.revisionId)
    .returns(parameters?.revisionId ?? cadModelOptions.revisionId)
    .setup((p) => p.getModelTransformation())
    .returns(new Matrix4())
    .setup(async (p) => await p.getBoundingBoxesByNodeIds(It.IsAny()))
    .returns(Promise.resolve([nodeBoundingBox]))
    .setup((p) => p.type)
    .returns('cad')
    .prototypeof(CogniteCadModel.prototype)
    .object();

  cad.visible = parameters?.visible ?? true;
  return cad;
}
