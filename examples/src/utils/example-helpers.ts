/*!
 * Copyright 2020 Cognite AS
 */

export function withBasePath(path: string) {
  let basePath = (process.env.PUBLIC_URL || '').trim();
  console.log({ basePath, PUBLIC_URL: process.env.PUBLIC_URL });
  if (!basePath.endsWith('/')) {
    basePath += "/";
  }

  // fixme: that must be fixed for reveal manager, not here
  if (basePath.startsWith('/')) {
    basePath = basePath.slice(1);
  }

  let pathArg = path;
  if (pathArg.startsWith('/')) {
    pathArg = path.slice(1);
  }
  return basePath + pathArg;
}

export function getParamsFromURL(
  defaults: {
    project: string;
    modelUrl?: string;
  },
  queryParameters?: {
    project?: string;
    modelId?: string;
    revisionId?: string;
    modelUrl?: string;
  }
) {
  const params = {
    project: 'project',
    modelId: 'modelId',
    revisionId: 'revisionId',
    modelUrl: 'modelUrl',
    ...queryParameters,
  };
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  const project = searchParams.get(params.project);
  const modelId = searchParams.get(params.modelId);
  const revisionId = searchParams.get(params.revisionId);
  const modelUrl = searchParams.get(params.modelUrl);

  const modelRevision =
    modelId !== null && revisionId !== null
      ? {
          modelId: Number.parseInt(modelId, 10),
          revisionId: Number.parseInt(revisionId, 10),
        }
      : undefined;
  return {
    project: project ? project : defaults.project,
    modelRevision,
    modelUrl: {
      fileName:
        modelUrl !== null
          ? withBasePath(modelUrl)
          : modelId === null && defaults.modelUrl
          ? withBasePath(defaults.modelUrl)
          : undefined,
    },
  };
}
