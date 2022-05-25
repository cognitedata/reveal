/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  CognitePointCloudModel,
  SupportedModelTypes
} from '@cognite/reveal';

import { CanvasWrapper } from '@site/docs/components/styled';
import { DemoProps } from '@site/docs/components/DemoProps';

type OwnProps = {
  modelType?: SupportedModelTypes;
};

export default function Cognite3DViewerDemo({
  client,
  modelId,
  revisionId,
}: DemoProps & OwnProps) {
  const canvasWrapperRef = useRef(null);

  useEffect(() => {
    if (!client || !canvasWrapperRef.current) {
      return;
    }

    // Prepare viewer
    const viewer = new Cognite3DViewer({
      sdk: client,
      domElement: canvasWrapperRef.current,
      antiAliasingHint: 'msaa4+fxaa'
    });

    async function addModel(options: AddModelOptions) {
      const model = await viewer.addModel(options);
      if (model.type === 'pointcloud') {
        // TODO 2022-04-29 larsmoa: Default point size is not good for test model. Will be improved in Reveal 3.1
        (model as CognitePointCloudModel).pointSize = 0.2;
      }
      viewer.loadCameraFromModel(model);
      window.model = model;
    }

    addModel({ modelId, revisionId });

    window.viewer = viewer;
    return () => {
      viewer && viewer.dispose();
    };
  }, [client]);

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
