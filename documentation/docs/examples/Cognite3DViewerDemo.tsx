/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  SupportedModelTypes,
} from '@cognite/reveal';

import { CanvasWrapper } from '../../src/components/styled';
import { DemoProps } from '../../src/components/DemoProps';

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

    addModel({ modelId: 5641986602571236, revisionId: 5254077049582015 });

    async function addModel(options: AddModelOptions) {
      const type = await viewer.determineModelType(
        options.modelId,
        options.revisionId
      );
      let model;
      if (type === SupportedModelTypes.CAD) {
        model = await viewer.addModel(options);
      } else if (type === SupportedModelTypes.PointCloud) {
        model = await viewer.addPointCloudModel(options);
      } else {
        throw new Error(`Model ID is invalid or is not supported`);
      }
      viewer.fitCameraToModel(model);
    }

    return () => {
      viewer && viewer.dispose();
    };
  }, [client]);

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
