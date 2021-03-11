import { CogsFileInfo } from 'src/components/FileUploader/FilePicker/types';
import { getHumanReadableFileSize } from 'src/components/FileUploader/utils/getHumanReadableFileSize';
import styled from 'styled-components';
import { Detail, Icon } from '@cognite/cogs.js';
import React from 'react';

type FileListItemProps = {
  file: CogsFileInfo;
  onRemove: (file: CogsFileInfo) => unknown;
};

export function FileListItem({ file, onRemove }: FileListItemProps) {
  return (
    <FileListItemContainer>
      <DetailStyled strong style={{ flexGrow: 1 }}>
        {file.name}
      </DetailStyled>

      <DetailStyled strong style={{ minWidth: 55, textAlign: 'right' }}>
        <FileStatusColumn file={file} />
      </DetailStyled>

      <IconRemove
        type="XCompact"
        style={{ visibility: file.status === 'done' ? 'hidden' : 'visible' }}
        onClick={() => onRemove(file)}
      />
    </FileListItemContainer>
  );
}

type FileStatusColumnProps = { file: CogsFileInfo };

function FileStatusColumn({ file }: FileStatusColumnProps) {
  if (file.status === 'done') {
    return <Icon type="Check" />;
  }
  if (file.status === 'uploading') {
    // todo: fancy progress bar
    return <>Uploading... {file.percent.toFixed(0)}%</>;
  }
  if (file.status === 'paused') {
    return <>Paused</>;
  }
  return <>{getHumanReadableFileSize(file.size, 0)}</>;
}

const FileListItemContainer = styled.div`
  display: flex;
  padding: 6px 9px;
  color: #8c8c8c;
  justify-content: space-between;
  align-items: center;
`;

const DetailStyled = styled(Detail)`
  letter-spacing: -0.004em !important;
  color: inherit !important;
`;

const IconRemove = styled(Icon)`
  &:hover {
    cursor: pointer;
    color: black;
  }
  margin-left: 21px;
  min-width: 16px;
  position: relative;
  /* click area extend */
  &:after {
    content: ' ';
    position: absolute;
    top: -3px;
    right: -3px;
    bottom: -3px;
    left: -3px;
  }
`;
