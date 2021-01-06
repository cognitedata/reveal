/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { TestViewer } from '../TestViewer';

export function DefaultCameraTestPage() {
  const newEnv = { camera: new THREE.PerspectiveCamera() };
  return <TestViewer modifyTestEnv={() => newEnv} />;
}
