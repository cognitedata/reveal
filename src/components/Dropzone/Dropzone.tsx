import React from 'react';

import { Body, Colors, Detail, Icon, Title } from '@cognite/cogs.js';
import { Upload } from 'antd';
import { DraggerProps } from 'antd/lib/upload';
import styled from 'styled-components';

import { useTranslation } from 'common/i18n';

type DropzoneProps = {
  description?: string;
  title?: string;
};

const Dropzone = ({
  description,
  title,
  ...draggerProps
}: DropzoneProps & DraggerProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledDropzone {...draggerProps}>
      <StyledDropzoneContent>
        <StyledDropzoneOnDrop>
          <Icon type="Upload" />
          <StyledDropzoneOnDropText level={6}>
            {t('file-drop-area-drop-text')}
          </StyledDropzoneOnDropText>
        </StyledDropzoneOnDrop>
        <StyledDocumentIcon />
        <StyledDropzoneTitle level={6} strong>
          {title ?? t('file-drop-area-title')}
        </StyledDropzoneTitle>
        <StyledDropzoneDetail strong>
          {description ?? t('file-drop-area-detail')}
        </StyledDropzoneDetail>
      </StyledDropzoneContent>
    </StyledDropzone>
  );
};

const StyledDocumentIcon = styled(Icon).attrs({
  type: 'Document',
  size: 40,
})`
  color: ${Colors['border--muted']};
`;

const StyledDropzoneContent = styled.div`
  border: 1px dashed ${Colors['border-default'].hex()};
  border-radius: 6px;
  padding: 36px;
  position: relative;
  pointer-events: none;
`;

const StyledDropzoneOnDrop = styled.div`
  align-items: center;
  background-color: #edf0ffe6;
  border-radius: 6px;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  padding: 36px;
  position: absolute;
  top: 0;
  visibility: hidden;
  width: 100%;
`;

const StyledDropzoneOnDropText = styled(Title)`
  color: ${Colors['text-primary'].hex()};
  margin-left: 12px;
`;

const StyledDropzone = styled(Upload.Dragger)`
  && {
    background-color: ${Colors['bg-accent'].hex()};
    border: none;
    padding: 0px;

    .ant-upload-btn {
      display: flex !important; /* overrides antd style */
      padding: 0px !important; /* overrides antd style */
      flex-direction: column;

      .ant-upload-drag-container {
        height: 100%;

        ${StyledDropzoneContent} {
          height: 100%;
        }
      }
    }

    :hover {
      background-color: ${Colors['bg-hover'].hex()};

      ${StyledDocumentIcon} {
        color: ${Colors['border--interactive--hover']};
      }

      ${StyledDropzoneContent} {
        border-color: ${Colors['bg-status-small--accent'].hex()};
      }
    }

    :active {
      background-color: ${Colors['bg-selected'].hex()};

      ${StyledDocumentIcon} {
        color: ${Colors['border--interactive--toggled-hover']};
      }

      ${StyledDropzoneContent} {
        border-color: ${Colors['bg-status-small--accent-hover'].hex()};
        border-width: 2px;
        padding: 35px;
      }
    }
  }

  &&.ant-upload-drag-hover {
    background-color: ${Colors['bg-hover'].hex()};

    ${StyledDocumentIcon} {
      color: ${Colors['border--interactive--hover']};
    }

    ${StyledDropzoneContent} {
      border: 2px solid ${Colors['bg-status-small--accent'].hex()};
      padding: 35px;
    }

    ${StyledDropzoneOnDrop} {
      visibility: visible;
    }
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
