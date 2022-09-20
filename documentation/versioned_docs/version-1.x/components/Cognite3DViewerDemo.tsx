/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  SupportedModelTypes
} from '@cognite/reveal-1.x';

import { CogniteClient } from '@cognite/sdk-1.x';

import { CanvasWrapper } from '@site/versioned_docs/version-1.x/components/styled';
import { DemoProps } from '@site/versioned_docs/version-1.x/components/DemoProps';

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
      //@ts-ignore
      sdk: client as CogniteClient,
      domElement: canvasWrapperRef.current,
      antiAliasingHint: 'msaa4+fxaa'
    });

    async function addModel(options: AddModelOptions) {
      const model = await viewer.addModel(options);
      viewer.loadCameraFromModel(model as any);
      // @ts-ignore
      window.model = model;
    }

    addModel({ modelId, revisionId });

    // @ts-ignore
    window.viewer = viewer;
    return () => {
      viewer && viewer.dispose();
    };
  }, [client]);

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
