/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import { CogniteClient } from '@cognite/sdk';
import {
  Cognite3DViewer,
  Cognite3DViewerOptions
} from '@cognite/reveal';

import { createSDKFromEnvironment } from '../utils/example-helpers';

export function SimpleViewer() {

  const url = new URL(window.location.href);
  const urlParams = url.searchParams;
  const environmentParam = urlParams.get('env');

  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: Cognite3DViewer;

    const project = urlParams.get('project');

    async function main() {
      let client: CogniteClient;;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.example', project, environmentParam);
      } else {
        client = new CogniteClient({
          appId: 'reveal.example.example',
          project: 'dummy',
          getToken: async () => 'dummy'
        });
      }

      let viewerOptions: Cognite3DViewerOptions = {
        sdk: client,
        domElement: canvasWrapperRef.current!,
        logMetrics: false,
        antiAliasingHint: (urlParams.get('antialias') || undefined) as any,
        ssaoQualityHint: (urlParams.get('ssao') || undefined) as any,
        continuousModelStreaming: true
      };

      // Prepare viewer
      viewer = new Cognite3DViewer(viewerOptions);
      (window as any).viewer = viewer;

    }

    main();

    return () => {
      delete (window as any).viewer;
      viewer?.dispose();
    };
  });
  return <CanvasWrapper ref={canvasWrapperRef} />;
}