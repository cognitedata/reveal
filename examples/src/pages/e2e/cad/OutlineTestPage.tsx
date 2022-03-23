/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { Cognite3DModel, NumericRange, IndexSet, TreeIndexNodeCollection, NodeOutlineColor, Cognite3DViewer } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function OutlineTestPage() {
  const modelUrl = 'primitives';

  function initializeViewer(viewer: Cognite3DViewer) {
    viewer.setBackgroundColor(new THREE.Color('lightGray'));
    viewer.cameraManager.setCameraState({position: new THREE.Vector3(31.63, 6.50, -12.18), 
      target: new THREE.Vector3(21.04, 0.53, -11.88)});
  }

  function styleModel(model: Cognite3DModel) {
    const nodesPerColor = 10;
    for (let color = 0; color < 8; ++color) {
      const indexes = new IndexSet();
      indexes.addRange(new NumericRange(nodesPerColor*color, 10));
      const nodes = new TreeIndexNodeCollection(indexes);
      model.assignStyledNodeCollection(nodes, { outlineColor: color as NodeOutlineColor});  
    }
  }
  
  return <Cognite3DTestViewer modelUrls={[modelUrl]} 
            fitCameraToModel={false}
            initializeCallback={initializeViewer}
            cadModelAddedCallback={styleModel}/>;
}

registerVisualTest('cad', 'outlines', 'Outline colors', <OutlineTestPage />)
