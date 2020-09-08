/*!
 * Copyright 2020 Cognite AS
 */
import React, { useEffect } from 'react';
import { DemoProps } from '../DemoProps';
import '@google/model-viewer';
import { ItemsResponse } from '@cognite/sdk';
import { env } from '../../env';

declare global {
  export namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.AllHTMLAttributes<HTMLImageElement>,
        {}
      >;
    }
  }
}

type BlobFormat = {
  blobId: number;
  format: string;
  version: number;
};

function makeDataUrl(data: ArrayBuffer) {
  return (
    'data:model/gltf-binary;base64,' +
    btoa(
      new Uint8Array(data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )
  );
}

export default function ModelPreviewDemo({ client }: DemoProps) {
  const modelId = env.modelId;
  const revisionId = env.revisionId;
  const [previewUrl, setPreviewUrl] = React.useState(undefined);
  useEffect(() => {
    if (!client) {
      return;
    }
    let isMounted = true;
    const outputsUrl = `${client.getBaseUrl()}/api/v1/projects/${
      client.project
    }/3d/models/${modelId}/revisions/${revisionId}/outputs`;
    const params = { params: { format: 'preview-glb' } };
    getPreviewUrl();

    async function getPreviewUrl() {
      const response = await client.get<ItemsResponse<BlobFormat>>(
        outputsUrl,
        params
      );

      // Need to first request the file then convert to a data url because we cannot
      // set the headers for the model-viewer requests so there is no authentication
      const data = await client.files3D.retrieve(response.data.items[0].blobId);
      if (isMounted) {
        setPreviewUrl(makeDataUrl(data));
      }
    }

    (window as any).sdk = client;

    return () => {
      isMounted = false;
    };
  }, [client]);

  if (!previewUrl) {
    return <div />;
  }

  return (
    <model-viewer
      camera-controls
      auto-rotate
      interaction-prompt="when-focused"
      alt={'3D preview of model ' + modelId + ', revision ' + revisionId}
      src={previewUrl}
    />
  );
}
