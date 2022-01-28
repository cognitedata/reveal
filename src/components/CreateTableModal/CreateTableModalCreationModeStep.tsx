import React from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Dropzone from 'components/Dropzone/Dropzone';

import CreateTableModalOption from './CreateTableModalOption';
import { CreationMode } from './CreateTableModal';

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
          <Dropzone {...fileProps} />
        </StyledCreateOption>
        <StyledCreateOption>
          <CreateTableModalOption
            description="Upload files later or write data directly using the API"
            icon="DataTable"
            isDisabled={isCreatingTable}
            isSelected={selectedCreationMode === CreationMode.Empty}
            onClick={selectCreationMode(CreationMode.Empty)}
            title="Create empty table"
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

export default CreateTableModalCreationModeStep;
