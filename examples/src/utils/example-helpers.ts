/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManager, LocalHostRevealManager } from '@cognite/reveal/experimental';
import { CogniteClient } from '@cognite/sdk';
import { RevealOptions } from '@cognite/reveal/public/RevealManagerBase';

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
      return new LocalHostRevealManager(client, options);
    default:
      throw new Error(`case ${type}: undefined in switch statement`);
  }
}

export function getParamsFromURL(defaults: { project: string; modelUrl?: string }) {
  const url = new URL(location.href);
  const searchParams = url.searchParams;

  const project = searchParams.get('project');
  const modelRevision = searchParams.get('model');
  const modelUrl = searchParams.get('modelUrl');

  return {
    project: project ? project : defaults.project,
    modelRevision: modelRevision ? Number.parseInt(modelRevision, 10) : undefined,
    modelUrl: modelUrl !== null ? modelUrl : modelRevision === null && defaults.modelUrl ? defaults.modelUrl : undefined
  };
}
