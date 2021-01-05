/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { Viewer } from '../Viewer';

export function DefaultCameraTestPage() {
  const newEnv = { camera: new THREE.PerspectiveCamera() };
  return <Viewer modifyTestEnv={() => newEnv} />;
}
