import React from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Dropzone from 'components/Dropzone/Dropzone';

import CreateTableModalOption from './CreateTableModalOption';
import { CreationMode } from './CreateTableModal';
import { useTranslation } from 'common/i18n';

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
  const { t } = useTranslation();
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
    <FormFieldWrapper isRequired title={t('create-table-modal-select-one')}>
      <StyledCreateOptions>
        <StyledCreateOption>
          <Dropzone {...fileProps} />
        </StyledCreateOption>
        <StyledCreateOption>
          <CreateTableModalOption
            description={t('create-table-modal-empty-table-option-description')}
            icon="DataTable"
            isDisabled={isCreatingTable}
            isSelected={selectedCreationMode === CreationMode.Empty}
            onClick={selectCreationMode(CreationMode.Empty)}
            title={t('create-table-modal-empty-table-option-title')}
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
