import React, { CSSProperties, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { Modal, message } from 'antd';

import sdk from '@cognite/cdf-sdk-singleton';
import { FileUploadResponse } from '@cognite/sdk';
import { fireErrorNotification } from 'utils/notifications';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
} from '@cognite/reveal';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';

type Props = {
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
  onUploadDone: () => void;
  style?: CSSProperties;
};

export function ThumbnailUploader({ style, viewer, model, ...props }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState('');
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob>();
  const [isUploading, setIsUploading] = useState(false);

  const screenshotWidth = 826;
  const screenshotHeight = 512;

  const takeScreenshot = async () => {
    try {
      let blob: Blob;
      if (viewer instanceof Cognite3DViewer) {
        const base64 = await viewer.getScreenshot(
          screenshotWidth,
          screenshotHeight
        );
        setThumbnailUri(base64);
        blob = base64ToBlob(base64);

        viewer.requestRedraw();
      } else {
        const blobURL = await viewer.getScreenshot(
          screenshotWidth,
          screenshotHeight
        );
        setThumbnailUri(blobURL);
        blob = await getBlobFromBlobURL(blobURL);
      }

      setIsOpenModal(true);
      setThumbnailBlob(blob);
    } catch (error) {
      fireErrorNotification({
        message: 'Screenshot could not be loaded',
        error,
      });
    }
  };

  const uploadScreenshot = async () => {
    if (!thumbnailBlob) {
      return;
    }
    setIsUploading(true);
    try {
      const response = (await sdk.files.upload({
        name: 'thumbnail.png',
        mimeType: 'image/png',
        source: '3d-models',
      })) as FileUploadResponse;

      const progressMessage = message.loading('Uploading Screenshot...');

      await fetch(response.uploadUrl, {
        method: 'PUT',
        body: thumbnailBlob,
        headers: {
          'Content-Type': 'image/png',
        },
      });

      const { modelId, revisionId } = model;
      await sdk.revisions3D.updateThumbnail(modelId, revisionId, response.id);

      progressMessage.then(() =>
        message.success('Thumbnail Upload Successful')
      );

      props.onUploadDone();
    } catch (e) {
      fireErrorNotification(e.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      setIsOpenModal(false);
    }
  };

  return (
    <>
      <Button
        style={style as any}
        type="tertiary"
        icon="Camera"
        title="Take a screenshot for the thumbnail"
        onClick={takeScreenshot}
      >
        Create thumbnail
      </Button>
      <Modal
        title="Screenshot Preview: Confirm Upload"
        visible={isOpenModal}
        onOk={uploadScreenshot}
        okText="Upload"
        onCancel={() => setIsOpenModal(false)}
        confirmLoading={isUploading}
      >
        <img
          src={thumbnailUri}
          width="400px"
          alt="Thumbnail could not be displayed"
          style={{
            display: 'block',
            margin: 'auto',
          }}
        />
      </Modal>
    </>
  );
}

// reveal uses base64 string for screenshot fn,
// but base64 is blocked by CSP (blob should be blocked too though)
function base64ToBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: 'image/jpeg' });
}

async function getBlobFromBlobURL(blobURL): Promise<Blob> {
  return fetch(blobURL).then((res) => res.blob()); // Gets the response and returns it as a blob
}
