/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  SupportedModelTypes,
  revealEnv
} from '@cognite/reveal';

import { CanvasWrapper } from '@site/src/components/styled';
import { DemoProps } from '@site/src/components/DemoProps';

// fixme: that's temporary until https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.1.0/ is available
revealEnv.publicPath = 'https://cdn.jsdelivr.net/npm/@cognite/reveal-parser-worker@1.1.0/dist/cdn/';

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
