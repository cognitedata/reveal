import React from 'react';
import { Button } from '@cognite/cogs.js';
import { STATUS } from '../FileUploaderModal/enums';

export const getDownloadControls = (
  downloadStatus: STATUS,
  onDownloadStart: () => unknown,
  onFinish: () => unknown,
  onDownloadStop: () => unknown
) => {
  let DownloadButton;
  let CancelButton;

  switch (downloadStatus) {
    case STATUS.NO_FILES:
      DownloadButton = (
        <Button type="primary" icon="Download" disabled>
          Download files
        </Button>
      );
      break;
    case STATUS.READY_TO_START:
      DownloadButton = (
        <>
          <Button type="primary" onClick={onDownloadStart} icon="Download">
            Download files
          </Button>
        </>
      );
      break;
    case STATUS.STARTED:
      DownloadButton = (
        <Button type="primary" icon="Loading">
          Starting download
        </Button>
      );
      CancelButton = (
        <Button type="danger" icon="XLarge" onClick={onDownloadStop}>
          Cancel upload
        </Button>
      );
      break;
    case STATUS.DONE:
      DownloadButton = (
        <Button type="primary" onClick={onFinish}>
          Finished downloading
        </Button>
      );
      break;
  }

  return [DownloadButton, CancelButton];
};
