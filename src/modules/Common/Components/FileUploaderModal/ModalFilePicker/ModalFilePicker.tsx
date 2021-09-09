import React from 'react';
import styled from 'styled-components';
import { Button, Detail, Title } from '@cognite/cogs.js';
import { margin } from 'src/cogs-variables';
import * as UPLODER_CONST from 'src/constants/UploderConstants';
import { VALID_MIME_TYPES } from 'src/constants/validMimeTypes';
import DocumentsImg from '../../FileUploader/FilePicker/img/Documents.svg';
import { FileDropzone } from '../../FileUploader/FilePicker/FileDropzone';
import { FilePickerHeadless } from '../../FileUploader/FilePicker/FilePickerHeadless';
import { CogsFile, CogsFileInfo } from '../../FileUploader/FilePicker/types';
import { ModalFileList } from './ModalFileList';
import { ModalFileUploadOption } from './ModalFileUploadOption';

export interface ModalFilePickerProps {
  files: Array<CogsFile | CogsFileInfo>;
  onChange: (files: Array<CogsFile | CogsFileInfo>) => unknown;
  onRemove: (file: CogsFileInfo) => unknown;
  onError?: (error: Error) => unknown;
  fileListChildren?: React.ReactNode;
  optionDisabled?: boolean;
  clearButton?: JSX.Element;
}

// that component gives you the default UI version of FilePicker,
// by composing smaller building blocks like FilePickerHeadless, Dropzone, FileList
// it also does filtering
export function ModalFilePicker({
  files,
  onChange,
  onRemove,
  optionDisabled,
  clearButton,
}: ModalFilePickerProps) {
  const acceptTypes = VALID_MIME_TYPES.map(
    (mimeType) => mimeType.extention
  ).join(', ');
  const maxTotalSizeInGB = UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES / 1024 ** 3;
  const maxFileCount = UPLODER_CONST.MAX_FILE_COUNT;

  return (
    <div>
      <FilePickerHeadless
        files={files}
        onChange={onChange}
        accept={acceptTypes}
      >
        {({ openSelectFileDialogue, openSelectDirectoryDialogue }) => (
          <FileDropzoneStyled>
            <ModalFileUploadOption isDisabled={optionDisabled || false} />
            <SelectFilesWrapper>
              <Title level={5} style={{ margin: `${margin.default} 0` }}>
                Drag and drop / select files
              </Title>

              <UploadOptionsWrapper>
                <FilePickerButtonsContainer>
                  <Button
                    style={{ marginRight: 16 }}
                    icon="FolderLine"
                    type="tertiary"
                    onClick={openSelectDirectoryDialogue}
                  >
                    Add directory
                  </Button>
                  <Button
                    icon="Image"
                    type="tertiary"
                    onClick={openSelectFileDialogue}
                  >
                    Add files
                  </Button>
                </FilePickerButtonsContainer>
                <div style={{ width: '190px' }}>
                  <Detail strong>* Supported files:</Detail>
                  <Detail>
                    {acceptTypes}. Max. {maxFileCount} files, total{' '}
                    {maxTotalSizeInGB} GB.
                  </Detail>
                </div>
              </UploadOptionsWrapper>
            </SelectFilesWrapper>

            <ModalFileList
              files={files}
              onRemove={onRemove}
              clearButton={clearButton}
            />
          </FileDropzoneStyled>
        )}
      </FilePickerHeadless>
    </div>
  );
}

const FileDropzoneStyled = styled(FileDropzone)`
  .dropzone-cta {
    display: flex;
    width: 0%;
    padding: 12px 20px;
    height: 345px;
    margin: ${margin.default} 0;
    box-shadow: 0 0 20px -5px rgba(133, 145, 243, 0.2);
    border: 1px solid #cccccc;
    border-radius: 10px;
    background: url('${DocumentsImg}') center no-repeat rgb(246, 247, 255);
  }
  &[drop-active='true'] {
    .dropzone-cta {
      box-shadow: 0 0 30px -10px rgb(114 124 204);
    }
  }
`;

const SelectFilesWrapper = styled.div`
  margin: 30px 0px 0px 0px;
`;

const UploadOptionsWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const FilePickerButtonsContainer = styled.div`
  display: flex;
  align-items: center;
`;
