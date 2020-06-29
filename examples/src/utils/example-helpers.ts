/*!
 * Copyright 2020 Cognite AS
 */

import {
  RevealManager,
  LocalHostRevealManager,
} from '@cognite/reveal/experimental';
import { CogniteClient } from '@cognite/sdk';
import { RevealOptions } from '@cognite/reveal/public/types';

// TODO 22-05-2020 j-bjorne: change to return render and added models
export function createRenderManager(
  type: 'local' | 'cdf',
  client: CogniteClient,
  options?: RevealOptions
): RevealManager | LocalHostRevealManager {
  switch (type) {
    case 'cdf':
      return new RevealManager(client, options);
    case 'local':
      return new LocalHostRevealManager(options);
    default:
      throw new Error(`case ${type}: undefined in switch statement`);
  }
}

export function getParamsFromURL(defaults: {
  project: string;
  modelUrl?: string;
}, queryParameters? : {
  project?: string,
  modelId?: string,
  revisionId?: string,
  modelUrl?: string
}) {
  const params = {project: 'project', modelId: 'modelId', revisionId: 'revisionId', modelUrl: 'modelUrl', ...queryParameters};
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  const project = searchParams.get(params.project);
  const modelId = searchParams.get(params.modelId);
  const revisionId = searchParams.get(params.revisionId);
  const modelUrl = searchParams.get(params.modelUrl);

  const modelRevision = modelId !== null && revisionId !== null
    ? {modelId: Number.parseInt(modelId, 10), revisionId: Number.parseInt(revisionId, 10)} 
    : undefined;
  return {
    project: project ? project : defaults.project,
    modelRevision,
    modelUrl:
      modelUrl !== null
        ? modelUrl
        : modelId === null && defaults.modelUrl
        ? defaults.modelUrl
        : undefined,
  };
}
