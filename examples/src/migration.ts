/*!
 * Copyright 2020 Cognite AS
 */
import * as reveal_migration from '@cognite/reveal/migration';
import { CogniteClient } from '@cognite/sdk';

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const project = urlParams.get('project');
  const modelIdStr = urlParams.get('modelId');
  const revisionIdStr = urlParams.get('revisionId');
  if (!project || !modelIdStr || !revisionIdStr) {
    throw new Error('Must provide "project", "modelId" and "revisionId" as URL parameters');
  }
  const modelId = Number.parseInt(modelIdStr, 10);
  const revisionId = Number.parseInt(revisionIdStr, 10);
  const domElement = document.getElementById('canvas-container')!;

  // Login
  const client = new CogniteClient({ appId: 'cognite.reveal.example' });
  client.loginWithOAuth({ project });
  await client.authenticate();

  // Load and show model
  const model = await reveal_migration.createCognite3DModel(modelId, revisionId, client);
  const viewer = new reveal_migration.Cognite3DViewer({ sdk: client, domElement });
  const migrationModel = await viewer.addModel(model);
  migrationModel.renderHints = { showSectorBoundingBoxes: true };
  viewer.fitCameraToModel(model);

  (window as any).viewer = viewer;
}

main();
