import React from 'react';

import styled from 'styled-components';

import { Progress } from 'antd';

import { AllIconTypes, Button, Detail, Icon } from '@cognite/cogs.js';

import { MimeTypes } from '../../../../../constants/validMimeTypes';
import { getHumanReadableFileSize } from '../utils/getHumanReadableFileSize';

import { CogsFileInfo } from './types';

type FileListItemProps = {
  file: CogsFileInfo;
  onRemove: (file: CogsFileInfo) => unknown;
};

const getIcon = (fileType: string): AllIconTypes => {
  switch (fileType) {
    // Image
    case MimeTypes.jpg:
    case MimeTypes.jpeg:
    case MimeTypes.png:
      return 'Image' as AllIconTypes;
    // Video
    case MimeTypes.mp4:
    case MimeTypes.webm:
      return 'VideoCam' as AllIconTypes;
    // Others
    default:
      return 'Placeholder' as AllIconTypes;
  }
};

export function FileListItem({ file, onRemove }: FileListItemProps) {
  return (
    <FileListItemContainer>
      <div className="nameAndIcon">
        <div
          style={{
            marginRight: '16px',
          }}
        >
          <Icon type={getIcon(file.type)} />
        </div>
        <DetailStyled strong>{file.name}</DetailStyled>
      </div>
      <div className="sizeAndStatus">
        <FileStatusColumn file={file} />
        {file.status !== 'done' && (
          <Button
            css={{ marginLeft: '8px' }}
            icon="Close"
            onClick={() => onRemove(file)}
            aria-label="remove file"
            type="ghost"
          />
        )}
      </div>
    </FileListItemContainer>
  );
}

type FileStatusColumnProps = { file: CogsFileInfo };

function FileStatusColumn({ file }: FileStatusColumnProps) {
  if (file.status === 'done') {
    return (
      <>
        <DetailStyled strong>
          {getHumanReadableFileSize(file.size, 0)}
        </DetailStyled>
        <div style={{ color: '#31C25A', marginLeft: '17.45px' }}>
          <Icon type="Checkmark" />
        </div>
      </>
    );
  }
  if (file.status === 'metadata created') {
    return <DetailStyled strong>metadata created</DetailStyled>;
  }
  if (file.status === 'uploading') {
    return (
      <Progress
        percent={file.percent}
        size="small"
        type="line"
        strokeColor="#31C25A"
        showInfo={false}
        trailColor="#E8E8E8"
        strokeLinecap="round"
        style={{ width: '50%' }}
      />
    );
  }
  if (file.status === 'paused') {
    return <DetailStyled strong>Paused</DetailStyled>;
  }
  return (
    <DetailStyled strong>{getHumanReadableFileSize(file.size, 0)}</DetailStyled>
  );
}

const FileListItemContainer = styled.div`
  display: flex;
  padding: 6px 9px;
  color: #8c8c8c;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  .nameAndIcon {
    display: flex;
    color: inherit !important;
  }

  .sizeAndStatus {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: inherit !important;
    width: 200px;
  }
`;

const DetailStyled = styled(Detail)`
  letter-spacing: -0.004em !important;
  color: inherit !important;
  text-overflow: ellipsis !important;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
`;
