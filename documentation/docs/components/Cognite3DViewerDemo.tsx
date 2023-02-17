/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
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

  const viewer = useMemo(() => {
    if (!canvasWrapperRef.current) {
      return;
    }

    return new Cognite3DViewer({
      sdk: client,
      domElement: canvasWrapperRef.current,
      antiAliasingHint: 'msaa4+fxaa'
    });
  }, [canvasWrapperRef, client]);

  useEffect(() => {
    if (!viewer) {
      return;
    }

    viewer.addModel({ modelId, revisionId }).then((model) => {
      viewer.loadCameraFromModel(model);
    });

    (window as any).viewer = viewer;

    return () => {
      viewer.dispose();
      (window as any).viewer = null;
    };
  }, [viewer]);

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
