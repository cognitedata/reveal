import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { CustomIcon } from '@transformations/components/custom-icon';
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
    <StyledDropzone {...draggerProps}>
      <StyledDropzoneContent>
        <StyledDropzoneOnDrop>
          <Icon type="Upload" />
          <StyledDropzoneOnDropText level={6}>
            {t('drop-upload')}
          </StyledDropzoneOnDropText>
        </StyledDropzoneOnDrop>
        <StyledDocumentIcon />
        <StyledDocumentIconHover />
        <StyledDropzoneTitle level={6} strong>
          {title ?? t('upload')}
        </StyledDropzoneTitle>
        <StyledDropzoneDetail strong>
          {description ?? t('upload-detail')}
        </StyledDropzoneDetail>
      </StyledDropzoneContent>
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

const StyledDropzoneContent = styled.div`
  border: 1px dashed ${Colors['border--status-undefined--muted']};
  border-radius: 6px;
  padding: 36px;
  position: relative;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    background-color: ${Colors['surface--strong']};
    border: none;
    padding: 0px;
    height: 100%;

    .ant-upload-btn {
      display: flex !important; /* overrides antd style */
      padding: 0px !important; /* overrides antd style */
      flex-direction: column;
      height: 100%;

      .ant-upload-drag-container {
        height: 100%;

        ${StyledDropzoneContent} {
          height: 100%;
        }
      }
    }

    ${StyledDocumentIconHover} {
      display: none;
    }

    :hover {
      background-color: ${Colors['surface--interactive--hover']};

      ${StyledDocumentIcon} {
        display: none;
      }

      ${StyledDocumentIconHover} {
        display: unset;
      }

      ${StyledDropzoneContent} {
        border-color: ${Colors['border--interactive--default']};
      }
    }

    :active {
      background-color: ${Colors['surface--interactive--toggled-default']};

      ${StyledDocumentIcon} {
        display: none;
      }

      ${StyledDocumentIconHover} {
        display: unset;
      }

      ${StyledDropzoneContent} {
        border-color: ${Colors['border--interactive--default']};
        border-width: 2px;
        padding: 35px;
      }
    }
  }

  &&.ant-upload-drag-hover {
    background-color: ${Colors['surface--interactive--hover']};

    ${StyledDocumentIcon} {
      display: none;
    }

    ${StyledDocumentIconHover} {
      display: unset;
    }

    ${StyledDropzoneContent} {
      border: 2px solid ${Colors['border--interactive--default']};
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
