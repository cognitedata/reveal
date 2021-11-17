/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@cognite/reveal';
import * as THREE from 'three';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

/**
 * Issue causing `matrixWorldNeedsUpdate=true` not to be obeyed for
 * custom objects. (ACEPC-120).
 */
function CustomObjectWithMatrixWorldNeedsUpdate() {
  function addCustomObject(viewer: Cognite3DViewer) {
    const parentGroup = new THREE.Group();
    viewer.addObject3D(parentGroup);

    const box = new THREE.BoxBufferGeometry(10);
    const boxMesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color: 'red'}));
    parentGroup.add(boxMesh);
    boxMesh.matrix.multiply(new THREE.Matrix4().makeTranslation(12, 0, -5));
    // boxMesh.onBeforeRender = () => {
    //   boxMesh.matrixWorldNeedsUpdate = false;
    //   console.log('before update matrix:', boxMesh.matrixWorld.clone());
    //   boxMesh.matrix.makeTranslation(Math.random() * 12, 0, Math.random() * 12);
    //   console.log('before render worldMatrix:', boxMesh.matrixWorld.clone());
    // };
    // boxMesh.onAfterRender = () => {
    //   console.log('needsUpdate:', boxMesh.matrixWorldNeedsUpdate, 'worldMatrix:', boxMesh.matrixWorld.clone());
    // };
}

  return (
    <Cognite3DTestViewer 
      modelUrls={['primitives']}
      initializeCallback={addCustomObject} />
  );
}
registerVisualTest('cad', 'custom-object-needsUpdate', 'Custom object with matrixWorldNeedsUpdate set', <CustomObjectWithMatrixWorldNeedsUpdate />)
