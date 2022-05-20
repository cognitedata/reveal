/*!
 * Copyright 2021 Cognite AS
 */

import { THREE } from '@cognite/reveal';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import { TestEnvCad, TestViewer } from '../TestViewer';
import { registerVisualTest } from '../../../visual_tests';

/**
 * Test verifies that edges from regular, highlighted and ghosted objects doesn't "bleed through"
 * custom objects in undesired ways (i.e. highlighted are overlaid, while ghosted and regular objects
 * are depth blended).
 */
function CustomObjectWithHighlightAndGhostedV8() {
  return (
    <TestViewer
      modelName={"primitives_v8"}
      modifyTestEnv={({sceneHandler, model }: TestEnvCad) => {
        const highlightedNodes = new TreeIndexNodeCollection([0, 2, 4, 6, 8, 10]);
        model.nodeAppearanceProvider.assignStyledNodeCollection(highlightedNodes, DefaultNodeAppearance.Highlighted);

        const ghostedNodes = new TreeIndexNodeCollection([1, 3, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        model.nodeAppearanceProvider.assignStyledNodeCollection(ghostedNodes, DefaultNodeAppearance.Ghosted);

        const sphere = new THREE.SphereBufferGeometry(5, 32, 16);
        const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 'red'}));
        sphereMesh.position.set(12, 0, -5);
        sceneHandler.addCustomObject(sphereMesh);

        return {
          cameraConfig: {
            position: new THREE.Vector3(9, 3.4, -12),
            target: new THREE.Vector3(12, 0, -5),
          },
        };
      }}
    />
  );
}
registerVisualTest('cad', 'customObjectWithHighlightAndGhostedV8', 'Custom objects with highlighted and ghosted objects V8', <CustomObjectWithHighlightAndGhostedV8 />)
