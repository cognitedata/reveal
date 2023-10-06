import React from 'react';

import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';

import { margin } from '../../../../../cogs-variables';

import { FileListItem } from './FileListItem';
import { CogsFileInfo } from './types';

type FileListProps = {
  files: CogsFileInfo[];
  onRemove: (file: CogsFileInfo) => unknown;
  children?: React.ReactNode;
};

export function FileList({ files, onRemove, children }: FileListProps) {
  return (
    <div>
      <Title level={5} style={{ margin: `${margin.default} 0` }}>
        {files.length} items selected
      </Title>

      <TableContainer
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
      </TableContainer>

      {children}
    </div>
  );
}

const TableContainer = styled.div`
  padding: 22px;
  margin: ${margin.default} 0;

  height: 409px;
  overflow: auto;

  & > *:nth-child(even) {
    background-color: #fbfbfb;
  }
  border-radius: 10px;
`;
