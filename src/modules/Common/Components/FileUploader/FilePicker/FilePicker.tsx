import React from 'react';
import styled from 'styled-components';
import { Button, Title } from '@cognite/cogs.js';
import { margin } from 'src/cogs-variables';
import { FilePickerHeadless } from './FilePickerHeadless';
import { FileDropzone } from './FileDropzone';
import { FileUploadOption } from './FileUploadOption';
import { CogsFile, CogsFileInfo } from './types';
import { FileList } from './FileList';
import DocumentsImg from './img/Documents.svg';

export interface FilePickerProps {
  files: Array<CogsFile | CogsFileInfo>;
  onChange: (files: Array<CogsFile | CogsFileInfo>) => unknown;
  onRemove: (file: CogsFileInfo) => unknown;
  accept?: string;
  onError?: (error: Error) => unknown;
  children: React.ReactNode;
  fileListChildren?: React.ReactNode;
  optionDisabled?: boolean;
}

// that component gives you the default UI version of FilePicker,
// by composing smaller building blocks like FilePickerHeadless, Dropzone, FileList
// it also does filtering
export function FilePicker({
  files,
  accept,
  onChange,
  onRemove,
  children,
  fileListChildren,
  optionDisabled,
}: FilePickerProps) {
  return (
    <div>
      <FilePickerHeadless files={files} onChange={onChange} accept={accept}>
        {({ openSelectFileDialogue, openSelectDirectoryDialogue }) => (
          <FileDropzoneStyled>
            <FilePickerContainer>
              <div>
                <FileUploadOption isDisabled={optionDisabled || false} />
                <Title level={5} style={{ margin: `${margin.default} 0` }}>
                  Drag and drop files:
                </Title>
                <div className="dropzone-cta">{children}</div>

                <FilePickerButtonsContainer>
                  <Button
                    style={{ marginRight: 16 }}
                    icon="Folder"
                    type="tertiary"
                    onClick={openSelectDirectoryDialogue}
                  >
                    Add folder
                  </Button>
                  <Button
                    icon="Image"
                    type="tertiary"
                    onClick={openSelectFileDialogue}
                  >
                    Add files
                  </Button>
                </FilePickerButtonsContainer>
              </div>

              <FileList files={files} onRemove={onRemove}>
                {fileListChildren}
              </FileList>
            </FilePickerContainer>
          </FileDropzoneStyled>
        )}
      </FilePickerHeadless>
    </div>
  );
}

const FilePickerContainer = styled.div`
  display: grid;
  column-gap: 80px;
  grid-template-columns: repeat(auto-fill, 649px);
  align-items: flex-end;
`;

const FilePickerButtonsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const FileDropzoneStyled = styled(FileDropzone)`
  .dropzone-cta {
    display: flex;
    width: 100%;
    padding: 12px 20px;
    margin: ${margin.default} 0;
    height: 345px;
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
