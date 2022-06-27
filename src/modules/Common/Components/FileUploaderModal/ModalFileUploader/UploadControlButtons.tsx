// todo: unused component
import React from 'react';
import { Button, Icon, Title } from '@cognite/cogs.js';
import { STATUS } from 'src/modules/Common/Components/FileUploaderModal/enums';

export const getUploadControls = (
  uploadStatus: STATUS,
  onUploadStart: () => unknown,
  onUploadStop: () => unknown,
  onRemoveFiles: () => unknown,
  onCloseModal: () => unknown,
  onFinish: () => unknown
) => {
  let UploadButton;
  let CancelButton;
  let RemoveAllButton;

  switch (uploadStatus) {
    case STATUS.NO_FILES:
      UploadButton = (
        <Button type="primary" icon="Upload" disabled>
          Upload files
        </Button>
      );
      CancelButton = (
        <Button type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
      );
      RemoveAllButton = (
        <Button type="ghost-danger" onClick={onRemoveFiles} disabled>
          Remove all
        </Button>
      );
      break;
    case STATUS.READY_TO_START:
      UploadButton = (
        <Button type="primary" onClick={onUploadStart} icon="Upload">
          Upload files
        </Button>
      );
      CancelButton = (
        <Button type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
      );
      RemoveAllButton = (
        <Button type="ghost-danger" onClick={onRemoveFiles}>
          Remove all
        </Button>
      );
      break;
    case STATUS.STARTED:
      UploadButton = (
        <Button type="primary" icon="Loader">
          Uploading files
        </Button>
      );
      CancelButton = (
        <Button type="danger" icon="CloseLarge" onClick={onUploadStop}>
          Cancel upload
        </Button>
      );
      RemoveAllButton = (
        <Button type="ghost-danger" onClick={onRemoveFiles} disabled>
          Remove all
        </Button>
      );
      break;
    case STATUS.DONE:
      UploadButton = (
        <Button type="primary" onClick={onFinish}>
          Finish uploading
        </Button>
      );
      CancelButton = (
        <Title level={5} style={{ color: '#31C25A' }}>
          <Icon
            type="Checkmark"
            style={{ marginRight: '8.7px' }}
            onMouseOver={() => {}}
          />
          Files uploaded
        </Title>
      );
      RemoveAllButton = (
        <Button type="ghost-danger" onClick={onRemoveFiles} disabled>
          Remove all
        </Button>
      );
      break;
  }

  return [UploadButton, CancelButton, RemoveAllButton];
};
