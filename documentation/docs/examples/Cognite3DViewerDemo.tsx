/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AddModelOptions,
  Cognite3DViewer,
  SupportedModelTypes,
} from '@cognite/reveal';
import {
  CogniteClient,
  isLoginPopupWindow,
  loginPopupHandler,
  POPUP,
} from '@cognite/sdk';

import { CanvasWrapper } from '../../src/components/styled';

export default function Cognite3DViewerDemo() {
  const canvasWrapperRef = useRef(null);
  const [client, setClient] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoginPopupWindow()) {
      loginPopupHandler();
      return;
    }

    const client = new CogniteClient({
      appId: 'cognite.reveal.docs.Cognite3DViewer',
    });
    client.loginWithOAuth({
      project: '3ddemo',
      onAuthenticate: POPUP,
    });

    setClient(client);
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }

    client.authenticate().then(() => {
      setIsLoggedIn(true);
    });

    if (!isLoggedIn || !canvasWrapperRef.current) {
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
  }, [client, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => {
          client.authenticate().then(() => setIsLoggedIn(true));
        }}
      >
        Login
      </button>
    );
  }

  return <CanvasWrapper ref={canvasWrapperRef} />;
}
