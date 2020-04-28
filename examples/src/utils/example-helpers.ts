/*!
 * Copyright 2020 Cognite AS
 */

export function getParamsFromURL(defaults: { project: string; modelUrl?: string }) {
  const url = new URL(location.href);
  const searchParams = url.searchParams;

  const project = searchParams.get('project');
  const modelRevision = searchParams.get('model');
  const modelUrl = searchParams.get('modelUrl');

  return {
    project: project ? project : defaults.project,
    modelRevision: modelRevision ? Number.parseInt(modelRevision, 10) : undefined,
    modelUrl:
      modelUrl !== null
        ? location.origin + '/' + modelUrl
        : modelRevision === null && defaults.modelUrl
        ? location.origin + '/' + defaults.modelUrl
        : undefined
  };
}
