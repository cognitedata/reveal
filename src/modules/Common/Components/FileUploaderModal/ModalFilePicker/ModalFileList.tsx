import React from 'react';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { FileListItem } from 'src/modules/Common/Components/FileUploader/FilePicker/FileListItem';
import SpiderImg from '../../FileUploader/FilePicker/img/Spider.svg';

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
          ...(!files.length && {
            background: `url(${SpiderImg}) top no-repeat`,
          }),
          border:
            files.length && files.every(({ status }) => status === 'done')
              ? '1px solid #31C25A'
              : '1px solid #cccccc',
        }}
      >
        {files.map((file) => (
          <FileListItem key={file.uid} file={file} onRemove={onRemove} />
        ))}
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

const Header = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  height: 36px;
  grid-gap: 10px;
  margin: 30px 0px 6px 0px;
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
