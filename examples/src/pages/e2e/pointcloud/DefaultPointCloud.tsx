/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../routes';
import { TestViewer } from '../TestViewer';

function DefaultPointCloudTestPage() {
  return (
    <TestViewer
      modelName="pointcloud-bunny"
      modelType="pointcloud"
    />
  );
}

registerVisualTest('pointcloud', 'default', 'Default', <DefaultPointCloudTestPage />);