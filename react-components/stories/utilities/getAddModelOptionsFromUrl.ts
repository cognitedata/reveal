/*!
 * Copyright 2023 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';

export function getAddModelOptionsFromUrl(localModelUrlFallback: string): AddModelOptions {
  const modelId = new URLSearchParams(window.location.search).get('modelId');
  const revisionId = new URLSearchParams(window.location.search).get('revisionId');
  const modelUrl = new URLSearchParams(window.location.search).get('modelUrl');

  if (modelId !== null && revisionId !== null) {
    return {
      modelId: parseInt(modelId),
      revisionId: parseInt(revisionId)
    };
  }

  return {
    modelId: 3544114490298106,
    revisionId: 6405404576933316,
    localPath: modelUrl ?? localModelUrlFallback
  };
}
