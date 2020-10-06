/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  SupportedModelTypes,
} from '@cognite/reveal';

import { CanvasWrapper } from '@site/src/components/styled';
import { DemoProps } from '@site/src/components/DemoProps';
import { env } from '@site/src/env';

const cadIds = {
  modelId: env.modelId,
  revisionId: env.revisionId,
};

const pointcloudIds = {
  modelId: env.pointCloud.modelId,
  revisionId: env.pointCloud.revisionId,
};

type OwnProps = {
  modelType?: SupportedModelTypes;
};

export default function Cognite3DViewerDemo({
  client,
  modelType,
}: DemoProps & OwnProps) {
  const canvasWrapperRef = useRef(null);
  const { modelId, revisionId } =
    modelType === 'pointcloud' ? pointcloudIds : cadIds;

  useEffect(() => {
    if (!client || !canvasWrapperRef.current) {
      return;
    }

    // Prepare viewer
    const viewer = new Cognite3DViewer({
      sdk: client,
      domElement: canvasWrapperRef.current,
    });
    addModel({ modelId, revisionId });

    async function addModel(options: AddModelOptions) {
      const model = await viewer.addModel(options);
      viewer.loadCameraFromModel(model);
      window.model = model;
    }

    window.viewer = viewer;
    return () => {
      viewer && viewer.dispose();
    };
  }, [client]);

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
