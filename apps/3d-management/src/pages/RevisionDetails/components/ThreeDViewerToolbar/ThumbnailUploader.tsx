import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { v3Client as sdk, v3 } from '@cognite/cdf-sdk-singleton';
import { base64ToBlob } from 'src/utils/base64ToBlob';
import { fireErrorNotification } from 'src/utils/notifications';

type Props = {
  onUploadDone: () => void;
  getScreenshot: (width: number, height: number) => Promise<string>;
  modelId: number;
  revisionId: number;
};

export function ThumbnailUploader(props: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState('');
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob>();
  const [isUploading, setIsUploading] = useState(false);

  const screenshotWidth = 826;
  const screenshotHeight = 512;

  const takeScreenshot = async () => {
    try {
      const base64 = await props.getScreenshot(
        screenshotWidth,
        screenshotHeight
      );

      setIsOpenModal(true);
      setThumbnailUri(base64);

      setThumbnailBlob(base64ToBlob(base64));
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
      })) as v3.FileUploadResponse;

      const progressMessage = message.loading('Uploading Screenshot...');

      await fetch(response.uploadUrl, {
        method: 'PUT',
        body: thumbnailBlob,
        headers: {
          'Content-Type': 'image/png',
        },
      });

      const { modelId, revisionId } = props;
      await sdk.revisions3D.updateThumbnail(modelId, revisionId, response.id);

      // @ts-ignore then requires catch - bad types
      // eslint-disable-next-line
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
        shape="round"
        icon="Camera"
        title="Take a screenshot for the thumbnail"
        onClick={takeScreenshot}
      >
        Create a thumbnail
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
