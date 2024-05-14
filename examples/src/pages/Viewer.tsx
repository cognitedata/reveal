/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import { Cognite3DViewer, Cognite3DViewerOptions } from '@cognite/reveal';
import * as reveal from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

(window as any).reveal = reveal;

export function Viewer() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check in order to avoid double initialization of everything, especially dat.gui.
    // See https://reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects for why its called twice.
    if (!canvasWrapperRef.current) {
      return;
    }

    const client = new CogniteClient({
      appId: 'reveal.example.example',
      project: 'dummy',
      getToken: async () => 'dummy'
    });

    let viewer: Cognite3DViewer;

    let viewerOptions: Cognite3DViewerOptions = {
      sdk: client,
      domElement: canvasWrapperRef.current!,
      useFlexibleCameraManager: true,
      // @ts-ignore
      _localModels: true
    };
    viewer = new Cognite3DViewer(viewerOptions);
    viewer.addModel({ localPath: '/primitives', modelId: -1, revisionId: -1 }).then(() => {
      viewer.dispose();
    });
  });

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
