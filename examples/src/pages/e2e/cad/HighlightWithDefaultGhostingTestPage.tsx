/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { DefaultNodeAppearance, TreeIndexNodeCollection, Cognite3DViewer, Cognite3DModel } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function HighlightWithDefaultGhostingTestPage() {

  function handleModelAdded(model: Cognite3DModel) {
    model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

    const nodes = new TreeIndexNodeCollection([...Array(15).keys()]);
    model.assignStyledNodeCollection(nodes, DefaultNodeAppearance.Highlighted);
  }

  return (
    <Cognite3DTestViewer
      modelUrls={['primitives']}
      cadModelAddedCallback={handleModelAdded}
      initializeCallback={(viewer: Cognite3DViewer) => {
          viewer.cameraManager.setCameraState({ position: new THREE.Vector3(12, -4, -45) });

        }}/>
  );
}

registerVisualTest('cad', 'highlight-with-default-ghosting', 'Highlight with "ghosted" as default style', <HighlightWithDefaultGhostingTestPage />)
