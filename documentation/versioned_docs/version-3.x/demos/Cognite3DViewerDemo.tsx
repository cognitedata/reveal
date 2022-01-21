/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  SupportedModelTypes
} from '@cognite/reveal-3.x';

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
