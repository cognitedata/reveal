/*!
 * Copyright 2022 Cognite AS
 */

import { getApplicationSDK } from '../../../test-utilities/src/appUtils';
import { AddModelOptions, CogniteModel, Cognite3DViewer, OnLoadingCallback } from '../../../packages/api';
import { CogniteClient } from '@cognite/sdk';
import type { WebGLRenderer } from 'three';

export async function createCognite3DViewer(
  onLoading: OnLoadingCallback = () => {},
  renderer?: WebGLRenderer
): Promise<Cognite3DViewer> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('modelId') && urlParams.has('revisionId')) {
    const client = await getApplicationSDK(urlParams);

    return new Cognite3DViewer({ sdk: client, logMetrics: false, onLoading, renderer: renderer });
  }

  const client = new CogniteClient({
    appId: 'reveal-visual-tests',
    project: 'dummy',
    getToken: async () => 'dummy'
  });

  return new Cognite3DViewer({
    sdk: client,
    _localModels: true,
    logMetrics: false,
    onLoading,
    pointCloudEffects: { edlOptions: 'disabled' },
    renderer: renderer
  });
}

export async function addModels(viewer: Cognite3DViewer, localModelUrls: string[]): Promise<CogniteModel[]> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('modelId') && urlParams.has('revisionId')) {
    return [
      await viewer.addModel({
        modelId: parseInt(urlParams.get('modelId')!),
        revisionId: parseInt(urlParams.get('revisionId')!)
      })
    ];
  }

  const modelNames = urlParams.has('modelUrl') ? [urlParams.get('modelUrl')!] : localModelUrls;

  return Promise.all(
    modelNames
      .map(modelName => {
        const fullModelUrl = `${window.location.origin}/${modelName}`;
        return {
          modelId: -1,
          revisionId: -1,
          localPath: fullModelUrl
        } as AddModelOptions;
      })
      .map(async modelOptions => {
        if (await isLocalUrlPointCloudModel(modelOptions.localPath!)) {
          return viewer.addPointCloudModel(modelOptions);
        } else {
          return viewer.addCadModel(modelOptions);
        }
      })
  );

  async function isLocalUrlPointCloudModel(modelBaseUrl: string) {
    // The hacky check below is due to webpack-dev-server returning 200 for non-existing files. We therefore check if the
    // response is a valid json.
    const eptJsonRequest = await fetch(modelBaseUrl + '/ept.json');
    try {
      if (eptJsonRequest.ok) {
        await eptJsonRequest.json();
      } else {
        return false;
      }
    } catch (_e) {
      return false;
    }
    return true;
  }
}
