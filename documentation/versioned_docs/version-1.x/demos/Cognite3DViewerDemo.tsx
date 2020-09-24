/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { AddModelOptions, Cognite3DViewer } from '@cognite/reveal';

import { CanvasWrapper } from '@site/src/components/styled';
import { DemoProps } from '@site/src/components/DemoProps';
import { env } from '@site/src/env';

const modelId = env.modelId;
const revisionId = env.revisionId;

export default function Cognite3DViewerDemo({ client }: DemoProps) {
  const canvasWrapperRef = useRef(null);
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
