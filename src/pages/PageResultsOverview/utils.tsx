import React from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { notification, Typography } from 'antd';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';
import { getContainer } from 'utils/utils';

const { Paragraph } = Typography;

export const convertSuccessNotification = (
  svgName: string,
  fileName: string,
  newFileId: number | string
) => {
  return notification.success({
    message: `SVG ${svgName} has been created successfully!`,
    getContainer,
    duration: null, // Keep notification till user closes it
    description: (
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
    ),
  });
};

export const convertErrorNotification = (
  fileName: string,
  errorMessage: string
) => {
  return notification.error({
    message: `Failed to create svg for file ${fileName}`,
    getContainer,
    duration: null, // Keep notification till user closes it
    description: <Paragraph>{errorMessage}</Paragraph>,
  });
};

export type StatusInfo = {
  type: keyof ApiStatusCount | 'idle';
  hover?: string;
};
