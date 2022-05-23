/*!
 * Copyright 2021 Cognite AS
 */

import { THREE } from '@cognite/reveal';
import React from 'react';
import { TestEnvCad, TestViewer } from '../TestViewer';
import { defaultRenderOptions } from '@cognite/reveal/internals';
import { registerVisualTest } from '../../../visual_tests';

function SsaoTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({revealManager }: TestEnvCad) => {

        (revealManager as any)._renderPipeline.renderOptions = defaultRenderOptions;

        return {
          cameraConfig: {
            position: new THREE.Vector3(0, -1, 2),
          },
        };
      }}
    />
  );
}

registerVisualTest('cad', 'ssao', 'SSAO', <SsaoTestPage />)
