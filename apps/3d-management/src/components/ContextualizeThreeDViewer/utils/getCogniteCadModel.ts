import {
  Cognite3DViewer,
  CogniteModel,
  CogniteCadModel,
} from '@cognite/reveal';

const isCogniteCadModel = (model: CogniteModel): model is CogniteCadModel =>
  model instanceof CogniteCadModel;

export const getCogniteCadModel = ({
  modelId,
  revisionId,
  viewer,
}: {
  modelId: number;
  revisionId: number;
  viewer: Cognite3DViewer;
}): CogniteCadModel | undefined => {
  return viewer.models
    .filter(isCogniteCadModel)
    .find(
      (model) => model.modelId === modelId && model.revisionId === revisionId
    );
};
