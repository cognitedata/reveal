/*!
 * Copyright 2020 Cognite AS
 */

import React from 'react';

import { TestViewer } from '../TestViewer';
import * as THREE from 'three';

export function HighlightTestPage() {
  return (
    <TestViewer
      modifyTestEnv={() => {
        return {
          camera: new THREE.PerspectiveCamera(),
          cameraConfig: {
            position: new THREE.Vector3(12, -4, -45),
          },
        };
      }}
    />
  );
}
