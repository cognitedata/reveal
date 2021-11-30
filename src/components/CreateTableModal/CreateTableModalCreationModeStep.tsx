import React from 'react';

import { Upload } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import styled from 'styled-components';

import { Body, Colors, Detail } from '@cognite/cogs.js';
import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import { CustomIcon } from 'components/CustomIcon';

import CreateTableModalOption from './CreateTableModalOption';
import { CreationMode } from './CreateTableModal';

const { Dragger } = Upload;

type CreateTableModalCreationModeStepProps = {
  isCreatingTable: boolean;
  selectCreationMode: (creationMode: CreationMode) => () => void;
  selectedCreationMode?: CreationMode;
  setFile: (file: File | undefined) => void;
};

const CreateTableModalCreationModeStep = ({
  isCreatingTable,
  selectCreationMode,
  selectedCreationMode,
  setFile,
}: CreateTableModalCreationModeStepProps): JSX.Element => {
  const fileProps = {
    accept: '.csv',
    beforeUpload: () => false,
    handleManualRemove: () => {
      setFile(undefined);
    },
    multiple: false,
    name: 'file',
    onChange: (info: UploadChangeParam) => {
      const file = info.fileList[0];
      if (file?.originFileObj) {
        setFile(file.originFileObj);
        selectCreationMode(CreationMode.Upload)();
      }
    },
  };

  return (
    <FormFieldWrapper isRequired title="Select one">
      <StyledCreateOptions>
        <StyledCreateOption>
          <StyledDragger {...fileProps}>
            <CustomIcon icon="DocumentIcon" style={{ width: 32 }} />
            <StyledCreateOptionTitle level={6} strong>
              Add CSV file here.
            </StyledCreateOptionTitle>
            <StyledCreateOptionDetail strong>
              Drag and drop, or click to select
            </StyledCreateOptionDetail>
          </StyledDragger>
        </StyledCreateOption>
        <StyledCreateOption>
          <CreateTableModalOption
            description="Upload files later or write data directly using the API."
            icon="DataTable"
            isDisabled={isCreatingTable}
            isSelected={selectedCreationMode === CreationMode.Empty}
            onClick={selectCreationMode(CreationMode.Empty)}
            title="Create an empty table"
          />
        </StyledCreateOption>
      </StyledCreateOptions>
    </FormFieldWrapper>
  );
};

const StyledCreateOptions = styled.ul`
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const StyledCreateOption = styled.li`
  flex: 1;

  :not(:last-child) {
    margin-right: 16px;
  }

  .ant-upload-list {
    display: none;
  }
`;

const StyledDragger = styled(Dragger)`
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

    :hover {
      background-color: ${Colors['bg-hover'].hex()};
      border-color: ${Colors['bg-status-small--accent'].hex()};
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

const StyledCreateOptionTitle = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  margin: 16px 0 8px;
`;

const StyledCreateOptionDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
  text-align: center;
`;

export default CreateTableModalCreationModeStep;
