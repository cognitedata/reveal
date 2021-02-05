/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { TestEnvCad, TestViewer } from '../TestViewer';
import { defaultRenderOptions } from '@cognite/reveal';

export function SsaoTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({renderer, revealManager, scene, camera }: TestEnvCad) => {
        
        //revealManager.render(renderer, camera, scene);

        const renderOptions = defaultRenderOptions;

        renderOptions.ssaoRenderParameters.depthCheckBias = 0.0125;
        renderOptions.ssaoRenderParameters.sampleRadius = 2.0;
        renderOptions.ssaoRenderParameters.sampleSize = 64;

        revealManager.renderOptions = renderOptions;

        return {
          cameraConfig: {
            position: new THREE.Vector3(0, -1, 2),
          },
        };
      }}
    />
  );
}
