import React from 'react';

import { STATUS } from '@vision/modules/Common/Components/FileUploaderModal/enums';

import { Button } from '@cognite/cogs.js';

export const getDownloadControls = (
  downloadStatus: STATUS,
  onDownloadStart: () => unknown,
  downloadMessage: string

  // onDownloadStop: () => unknown
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
        <Button type="primary" icon="Loader">
          {`Downloading (${downloadMessage})`}
        </Button>
      );
      // TODO: fix cancel
      // CancelButton = (
      //   <Button type="danger" icon="CloseLarge" onClick={onDownloadStop}>
      //     Cancel upload
      //   </Button>
      // );
      break;
  }

  return [DownloadButton, CancelButton];
};
