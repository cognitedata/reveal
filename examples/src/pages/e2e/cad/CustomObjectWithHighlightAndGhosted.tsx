/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import { TestEnvCad, TestViewer } from '../TestViewer';

/**
 * Test verifies that edges from regular, highlighted and ghosted objects doesn't "bleed through"
 * custom objects in undesired ways (i.e. highlighted are overlaid, while ghosted and regular objects
 * are depth blended).
 */
export function CustomObjectWithHighlightAndGhosted() {
  return (
    <TestViewer
      modifyTestEnv={({scene, model }: TestEnvCad) => {
        const highlightedNodes = new TreeIndexNodeCollection([0, 2, 4, 6, 8, 10]);
        model.nodeAppearanceProvider.assignStyledNodeCollection(highlightedNodes, DefaultNodeAppearance.Highlighted);

        const ghostedNodes = new TreeIndexNodeCollection([1, 3, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        model.nodeAppearanceProvider.assignStyledNodeCollection(ghostedNodes, DefaultNodeAppearance.Ghosted);

        const sphere = new THREE.SphereBufferGeometry(5);
        const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 'red'}));
        sphereMesh.position.set(12, 0, -5);
        scene.add(sphereMesh);

        return {
          cameraConfig: {
            position: new THREE.Vector3(3.3, 9, -24),
            target: new THREE.Vector3(12, 0, -5), 
          },
        };
      }}
    />
  );
}
