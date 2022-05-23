/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel, Cognite3DViewer, DefaultNodeAppearance, NumericRange, THREE, TreeIndexNodeCollection } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

/**
 * Test verifies that edges from regular, highlighted and ghosted objects doesn't "bleed through"
 * custom objects in undesired ways (i.e. highlighted are overlaid, while ghosted and regular objects
 * are depth blended).
 */
function CustomObjectBlending() {
  const modelUrl = 'primitives';
  
  return <Cognite3DTestViewer modelUrls={[modelUrl]} initializeCallback={(viewer:Cognite3DViewer) => {
    viewer.renderer.setClearColor(new THREE.Color(0.1, 0.2, 0.3), 0.5);
    viewer.domElement.style.backgroundColor = "#777777";
    viewer.cameraManager.setCameraState({position: new THREE.Vector3(30,10,50), target: new THREE.Vector3()});

    const customBox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 10, 20),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 0, 0),
        transparent: true,
        opacity: 0.5,
        depthTest: true
      })
    );
  
    customBox.position.set(0, 0, -15);
    viewer.addObject3D(customBox);

    const customBox2 = new THREE.Mesh(
      new THREE.BoxGeometry(5, 10, 20),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0, 0) }));
  
    customBox2.position.set(10, 0, -15);
    viewer.addObject3D(customBox2);

    const customBox3 = new THREE.Mesh(
      new THREE.BoxGeometry(5, 10, 20),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 0, 0),
        blending: THREE.CustomBlending,
        opacity: 0.4
      })
    );
  
    customBox3.position.set(20, 0, -15);
    viewer.addObject3D(customBox3);

    const transformControls = new TransformControls(viewer.getCamera(), viewer.renderer.domElement);
    transformControls.attach(customBox);
    viewer.addObject3D(transformControls);

    const grid = new THREE.GridHelper(30, 40);
    grid.position.set(14, -1, -14);
    viewer.addObject3D(grid);

  }} cadModelAddedCallback={(model: Cognite3DModel, modelIndex: number, modelUrl: string) => {
    model.assignStyledNodeCollection(
      new TreeIndexNodeCollection(new NumericRange(0, 10)),
      DefaultNodeAppearance.Ghosted
    );

    model.assignStyledNodeCollection(
      new TreeIndexNodeCollection(new NumericRange(10, 20)),
      DefaultNodeAppearance.Highlighted
    );

    model.assignStyledNodeCollection(new TreeIndexNodeCollection(new NumericRange(40, 41)), {
      ...DefaultNodeAppearance.Default,
      outlineColor: 6
    });
  }}/>;
}
registerVisualTest('cad', 'customObjectBlending', 'Custom objects with different blending', <CustomObjectBlending />)
