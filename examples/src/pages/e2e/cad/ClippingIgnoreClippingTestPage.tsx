/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { Cognite3DModel, Cognite3DViewer, DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function ClippingIgnoreClippingTestPage() {
  const modelUrl = 'primitives';

  function initializeClipping(viewer: Cognite3DViewer) {
    const plane1 = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.15, 0));
    const plane2 = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.05, 0));
    viewer.setClippingPlanes([plane1, plane2]);
  }

  function styleModel(model: Cognite3DModel) {
    const nodes = new TreeIndexNodeCollection([...Array(30).keys()].map(x => 2*x));
    model.assignStyledNodeCollection(nodes, DefaultNodeAppearance.IgnoreClipping);
  }
  
  return <Cognite3DTestViewer modelUrls={[modelUrl]} 
            initializeCallback={initializeClipping}
            modelAddedCallback={styleModel}/>;
}

registerVisualTest('cad', 'clipping-ignoreClipping', 'Clipping with ignoreClipping-nodes', <ClippingIgnoreClippingTestPage />)
