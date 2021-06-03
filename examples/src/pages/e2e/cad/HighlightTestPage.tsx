/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';

import { TestEnvCad, TestViewer } from '../TestViewer';
import * as THREE from 'three';
import { DefaultNodeAppearance, ByTreeIndexNodeSet } from '@cognite/reveal';

export function HighlightTestPage() {
  return (
    <TestViewer
    modifyTestEnv={({ model }: TestEnvCad) => {
      const nodeAppearanceProvider = model.nodeAppearanceProvider;
      const nodes = new ByTreeIndexNodeSet([...Array(15).keys()]);
      nodeAppearanceProvider.addStyledSet(nodes, DefaultNodeAppearance.Highlighted);

      return {
        camera: new THREE.PerspectiveCamera(),
        cameraConfig: {
          position: new THREE.Vector3(12, -4, -45),
        },
      }}}
    />
  );
}
