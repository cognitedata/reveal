/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel, Cognite3DViewer, DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import * as THREE from 'three';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

/**
 * Test verifies that transparent custom objects are blended correctly with model when viewer background color
 * is overridden.
 */
function TransparentCustomObjectWithBackgroundColor() {
  const modelUrl = 'primitives';
  
  function initializeViewer(viewer: Cognite3DViewer) {
    const sphere = new THREE.BoxGeometry(7, 5, 7);
    const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 'blue', transparent: true, opacity: 0.5 }));
    sphereMesh.position.set(2, 0, -5);
    viewer.addObject3D(sphereMesh);
  }

  function styleNodes(model: Cognite3DModel) {
    const highlightedNodes = new TreeIndexNodeCollection([0, 2, 4, 6, 8, 10]);
    model.assignStyledNodeCollection(highlightedNodes, DefaultNodeAppearance.Highlighted);

    const ghostedNodes = new TreeIndexNodeCollection([1, 3, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    model.assignStyledNodeCollection(ghostedNodes, DefaultNodeAppearance.Ghosted);
  }

  function placeCamera(viewer: Cognite3DViewer) {
    viewer.setBackgroundColor(new THREE.Color('darkGray'));
    // Not sure why setting camera immediately wont work :s 
    // *Probably* caused by fitCameraToModel() being deferred.
    setTimeout(() => {
      viewer.setCameraPosition(new THREE.Vector3(21.5, 15.3, -12.2));
      viewer.setCameraTarget(new THREE.Vector3(5.8, 6.3, -6.87));
    }, 50);
  }

  return <Cognite3DTestViewer 
    modelUrls={[modelUrl]} 
    initializeCallback={initializeViewer} 
    modelAddedCallback={styleNodes} 
    pageReadyCallback={placeCamera} 
    viewerOptions={{
      // Dont use any post-processing effects
      antiAliasingHint: 'msaa2',
      ssaoQualityHint: 'high',
      enableEdges: true,
    }} />;
}

registerVisualTest('cad', 'transparentCustomObjectWithBackgroundColor', 'Transparent custom objects with overridden background color', <TransparentCustomObjectWithBackgroundColor />)
