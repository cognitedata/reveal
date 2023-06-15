import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import { Upload } from 'antd';
import { DraggerProps } from 'antd/lib/upload';

import { Body, Colors, Detail, Icon, Title } from '@cognite/cogs.js';

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
    <StyledDropzone {...draggerProps} fileList={[]}>
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
  border: 1px dashed ${Colors['border--interactive--default']};
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
  color: ${Colors['text-icon--strong']};
  margin-left: 12px;
`;

const StyledDropzone = styled(Upload.Dragger)`
  && {
    background-color: ${Colors['surface--medium']};
    border: none;
    border-radius: 6px;
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
      background-color: ${Colors['surface--interactive--toggled-hover']};

      ${StyledDocumentIcon} {
        color: ${Colors['text-icon--interactive--hover']};
      }

      ${StyledDropzoneContent} {
        border-color: ${Colors['border--interactive--hover']};
      }
    }

    :active {
      background-color: ${Colors['surface--interactive--toggled-pressed']};

      ${StyledDocumentIcon} {
        color: ${Colors['text-icon--interactive--pressed']};
      }

      ${StyledDropzoneContent} {
        border-color: ${Colors['border--interactive--toggled-default']};
        border-width: 2px;
        padding: 35px;
      }
    }
  }

  &&.ant-upload-drag-hover {
    background-color: ${Colors['surface--interactive--hover']};

    ${StyledDocumentIcon} {
      color: ${Colors['border--interactive--hover']};
    }

    ${StyledDropzoneContent} {
      border: 2px solid ${Colors['surface--status-neutral--muted--default']};
      padding: 35px;
    }

    ${StyledDropzoneOnDrop} {
      visibility: visible;
    }
  }
`;

const StyledDropzoneTitle = styled(Body)`
  color: ${Colors['text-icon--strong']};
  margin: 16px 0 8px;
`;

const StyledDropzoneDetail = styled(Detail)`
  color: ${Colors['text-icon--muted']};
  text-align: center;
`;

export default Dropzone;
