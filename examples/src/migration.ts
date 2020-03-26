/*!
 * Copyright 2020 Cognite AS
 */
import * as reveal_migration from '@cognite/reveal/migration';
import { CogniteClient } from '@cognite/sdk';
import dat from 'dat.gui';

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const project = urlParams.get('project');
  if (!project) {
    throw new Error('Must provide "project"as URL parameter');
  }
  const domElement = document.getElementById('canvas-container')!;

  // Login
  const client = new CogniteClient({ appId: 'cognite.reveal.example' });
  client.loginWithOAuth({ project });
  await client.authenticate();

  // Prepare viewer
  const viewer = new reveal_migration.Cognite3DViewer({ sdk: client, domElement });
  (window as any).viewer = viewer;

  async function addModel(options: reveal_migration.AddModelOptions) {
    const model = await viewer.addModel(options);
    viewer.fitCameraToModel(model);
    models.push(model);
  }

  // Add GUI for loading models and such
  const models: reveal_migration.Cognite3DModel[] = [];
  const guiState = { modelId: 0, revisionId: 0, showSectorBoundingBoxes: false };
  function applySettingsToModels() {
    models.forEach(m => {
      m.renderHints = { ...m.renderHints, showSectorBoundingBoxes: guiState.showSectorBoundingBoxes };
    });
  }
  const guiActions = {
    addModel: () =>
      addModel({
        modelId: guiState.modelId,
        revisionId: guiState.revisionId
      })
  };
  const gui = new dat.GUI();
  const settingsGui = gui.addFolder('settings');
  settingsGui
    .add(guiState, 'showSectorBoundingBoxes')
    .name('Show bounding boxes')
    .onChange(applySettingsToModels);
  gui.add(guiState, 'modelId').name('Model ID');
  gui.add(guiState, 'revisionId').name('Revision ID');
  gui.add(guiActions, 'addModel').name('Load model');

  // Load model if provided by URL
  const modelIdStr = urlParams.get('modelId');
  const revisionIdStr = urlParams.get('revisionId');
  if (modelIdStr && revisionIdStr) {
    const modelId = Number.parseInt(modelIdStr, 10);
    const revisionId = Number.parseInt(revisionIdStr, 10);
    addModel({ modelId, revisionId });
  }
  viewer.on('click', function(event) {
    const { offsetX, offsetY } = event;
    console.log('2D coordinates', event);
    const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
    if (intersection !== null) {
      const { nodeId, point, model } = intersection;
      console.log(`Clicked node ${nodeId} at`, point);
      // highlight the object
      model.setNodeColor(nodeId, 0, 255, 0);
      // TODO make the camera zoom to the object
      //const boundingBox = model.getBoundingBox(nodeId);
      //viewer.fitCameraToBoundingBox(boundingBox, 2000); // 2 sec
    }
  });
}

main();
