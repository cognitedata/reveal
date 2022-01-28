import React from 'react';

import { Body, Colors, Detail } from '@cognite/cogs.js';
import { Upload } from 'antd';
import { DraggerProps } from 'antd/lib/upload';
import styled from 'styled-components';

import { CustomIcon } from 'components/CustomIcon';

type DropzoneProps = {
  description?: string;
  title?: string;
};

const Dropzone = ({
  description,
  title,
  ...draggerProps
}: DropzoneProps & DraggerProps): JSX.Element => {
  return (
    <StyledDropzone {...draggerProps}>
      <StyledDocumentIcon />
      <StyledDocumentIconHover />
      <StyledDropzoneTitle level={6} strong>
        {title ?? 'Upload CSV file'}
      </StyledDropzoneTitle>
      <StyledDropzoneDetail strong>
        {description ?? 'Drag and drop, or click to select'}
      </StyledDropzoneDetail>
    </StyledDropzone>
  );
};

const StyledDocumentIcon = styled(CustomIcon).attrs({
  icon: 'DocumentIconDisabled',
})`
  height: 40px;
`;

const StyledDocumentIconHover = styled(CustomIcon).attrs({
  icon: 'DocumentIconHover',
})`
  height: 40px;
`;

const StyledDropzone = styled(Upload.Dragger)`
  && {
    background-color: ${Colors['bg-accent'].hex()};
    border-color: ${Colors['border-default'].hex()};
    border-radius: 6px;
    padding: 0px;

    .ant-upload-btn {
      display: flex !important; /* overrides antd style */
      padding: 36px !important; /* overrides antd style */
      flex-direction: column;
    }

    ${StyledDocumentIconHover} {
      display: none;
    }

    :hover {
      background-color: ${Colors['bg-hover'].hex()};
      border-color: ${Colors['bg-status-small--accent'].hex()};

      ${StyledDocumentIcon} {
        display: none;
      }

      ${StyledDocumentIconHover} {
        display: unset;
      }
    }

    :active {
      background-color: ${Colors['bg-selected'].hex()};
      border-color: ${Colors['bg-status-small--accent-hover'].hex()};
      border-width: 2px;
      padding: 0px;

      .ant-upload-btn {
        padding: 35px !important; /* overrides antd style */
      }
    }
  }

  &&.ant-upload-drag-hover {
    background-color: ${Colors['bg-hover'].hex()};
    border-color: ${Colors['bg-status-small--accent'].hex()};
  }
`;

const StyledDropzoneTitle = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  margin: 16px 0 8px;
`;

const StyledDropzoneDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
  text-align: center;
`;

export default Dropzone;
