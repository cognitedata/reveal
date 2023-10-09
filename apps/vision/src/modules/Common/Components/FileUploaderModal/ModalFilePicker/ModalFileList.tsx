import React from 'react';

import styled from 'styled-components';

import { Illustrations, Title } from '@cognite/cogs.js';

import { FileListItem } from '../../FileUploader/FilePicker/FileListItem';
import { CogsFileInfo } from '../../FileUploader/FilePicker/types';

type ModalFileListProps = {
  files: CogsFileInfo[];
  onRemove: (file: CogsFileInfo) => unknown;
  clearButton?: JSX.Element;
};

export function ModalFileList({
  files,
  onRemove,
  clearButton,
}: ModalFileListProps) {
  return (
    <div>
      <Header>
        <Left>
          <Title level={5}>{files.length} items selected</Title>
        </Left>
        <Right>{clearButton}</Right>
      </Header>

      <FileListContainer
        style={{
          border:
            files.length && files.every(({ status }) => status === 'done')
              ? '1px solid #31C25A'
              : '1px solid #cccccc',
        }}
      >
        {files.map((file) => (
          <FileListItem key={file.uid} file={file} onRemove={onRemove} />
        ))}
        {!files.length && (
          <Background>
            <Illustrations.Solo type="EmptyStateFile" prominence="muted" />
            <Title level={5}>No items selected for upload</Title>
          </Background>
        )}
      </FileListContainer>
    </div>
  );
}

const FileListContainer = styled.div`
  padding: 22px;
  height: 324px;
  overflow: auto;
  & > *:nth-child(even) {
    background-color: #fbfbfb;
  }
  border-radius: 10px;
`;

const Background = styled.div`
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  position: relative;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  height: 36px;
  grid-gap: 10px;
  margin: 30px 0 6px 0;
`;
const Left = styled.div`
  align-self: center;
  grid-gap: 10px;
`;

const Right = styled.div`
  justify-self: end;
  align-self: center;
  grid-gap: 10px;
`;
