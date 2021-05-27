/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { TestViewer } from '../TestViewer';

export function DefaultPointCloudTestPage() {
  return (
    <TestViewer
      modelName="pointcloud-bunny"
      modelType="pointcloud"
    />
  );
}
