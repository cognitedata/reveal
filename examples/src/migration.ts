/*!
 * Copyright 2020 Cognite AS
 */
import * as reveal_migration from '@cognite/reveal/migration';

async function main() {
  // const model = new reveal_migration.Cognite3DModel();
  const viewer = new reveal_migration.Cognite3DViewer();
  // viewer.addModel(model);

  document.body.appendChild(viewer.domElement);
}

main();
