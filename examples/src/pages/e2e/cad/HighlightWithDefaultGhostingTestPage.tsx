/*!
 * Copyright 2021 Cognite AS
 */

import { TestEnvCad, TestViewer } from '../TestViewer';
import * as THREE from 'three';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';

function HighlightWithDefaultGhostingTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({ model }: TestEnvCad) => {
        const nodeAppearanceProvider = model.nodeAppearanceProvider;
        model.defaultNodeAppearance = DefaultNodeAppearance.Ghosted;
        const nodes = new TreeIndexNodeCollection([...Array(15).keys()]);
        nodeAppearanceProvider.assignStyledNodeCollection(nodes, DefaultNodeAppearance.Highlighted);

        return {
          camera: new THREE.PerspectiveCamera(),
          cameraConfig: {
            position: new THREE.Vector3(12, -4, -45),
          },
      }}}
    />
  );
}

registerVisualTest('cad', 'highlight-with-default-ghosting', 'Highlight with "ghosted" as default style', <HighlightWithDefaultGhostingTestPage />)
