import React from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { notification, Typography } from 'antd';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';
import { getContainer } from 'utils/utils';

const { Paragraph } = Typography;

export const convertSuccessNotification = (
  svgName?: string,
  fileName?: string,
  newFileId?: number | string
) => {
  const single = svgName && fileName && newFileId;
  const message = single
    ? `SVG ${svgName} has been created successfully!`
    : 'All of the selected diagrams have been successfully converted to SVG!';
  const duration = null; // null keeps the notification as long as someone closes it
  const description = single ? (
    <Paragraph>
      File {fileName} has been converted to an SVG successfully.
      <a
        href={createLink(`/explore/file/${newFileId}`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {' '}
        Click here to view file.
      </a>
    </Paragraph>
  ) : null;
  return notification.success({
    message,
    getContainer,
    duration,
    description,
  });
};

export const convertErrorNotification = (
  errorMessage: string,
  fileName?: string
) => {
  const message = fileName
    ? `Failed to create SVG for file ${fileName}`
    : 'Failed to create SVG';
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
