/*!
 * Copyright 2021 Cognite AS
 */

import { THREE } from '@cognite/reveal';
import React from 'react';
import { TestViewer } from '../TestViewer';
import { registerVisualTest } from '../../../visual_tests';

function DefaultCameraTestPage() {
  const newEnv = { camera: new THREE.PerspectiveCamera() };
  return <TestViewer modifyTestEnv={() => newEnv} />;
}

registerVisualTest('cad', 'defaultCamera', 'Default camera', <DefaultCameraTestPage />)
