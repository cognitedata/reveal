import { CogniteCadModel } from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Matrix4 } from 'three';

export const cadModelOptions = {
  modelId: 123,
  revisionId: 456
};

export const cadMock = new Mock<CogniteCadModel>()
  .setup((p) => p.modelId)
  .returns(cadModelOptions.modelId)
  .setup((p) => p.revisionId)
  .returns(cadModelOptions.revisionId)
  .setup((p) => p.getModelTransformation())
  .returns(new Matrix4())
  .object();
