import React from 'react';
import { notification, Typography } from 'antd';
import {
  PnidsConvertJobSchema,
  ApiStatusCount,
} from 'modules/contextualization/pnidParsing';
import { ERRORS } from 'stringConstants';
import { getContainer } from 'utils/utils';

const { Paragraph } = Typography;

export const convertSuccessNotification = (data: PnidsConvertJobSchema) => {
  const { numFiles = 0, statusCount = {} } = data;
  const content: any = {
    getContainer,
    duration: null,
  };

  // all files converted successfully
  if (!statusCount.failed) {
    content.message =
      numFiles === 1
        ? 'Selected diagram has been successfully converted to SVG'
        : 'All of the selected diagrams have been successfully converted to SVG';
    notification.success(content);
  }
  // some but not all files failed
  else if (statusCount.failed && statusCount.failed < numFiles) {
    content.message = 'SVG convertion finished';
    content.description = `${statusCount.completed ?? 0} file${
      (statusCount.completed ?? 0) > 1 ? 's were' : ' was'
    } converted successfully. Failed to create SVG for ${
      statusCount.failed ?? 0
    } file${(statusCount.failed ?? 0) > 1 ? 's' : ''}.`;
    notification.success(content);
  }
  // all files failed
  else if (statusCount.failed === numFiles) {
    convertErrorNotification(ERRORS.SVG_BAD.translation);
  }
};

export const convertErrorNotification = (errorMessage: string) => {
  const message = ERRORS.SVG_BAD.translation;
  return notification.error({
    message,
    getContainer,
    duration: null, // Keep notification till user closes it
    description: <Paragraph>{errorMessage}</Paragraph>,
  });
};

export type StatusInfo = {
  type: keyof ApiStatusCount | 'idle';
  hover?: string;
};
