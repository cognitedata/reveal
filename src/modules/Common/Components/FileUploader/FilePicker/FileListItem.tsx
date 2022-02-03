import React from 'react';
import { CogsFileInfo } from 'src/modules/Common/Components/FileUploader/FilePicker/types';
import { getHumanReadableFileSize } from 'src/modules/Common/Components/FileUploader/utils/getHumanReadableFileSize';
import styled from 'styled-components';
import { AllIconTypes, Detail, Icon } from '@cognite/cogs.js';
import { Progress } from 'antd';
import { MimeTypes } from 'src/constants/validMimeTypes';

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
        <Icon
          type={getIcon(file.type)}
          style={{
            marginRight: '16px',
          }}
        />
        <DetailStyled strong>{file.name}</DetailStyled>
      </div>
      <div className="sizeAndStatus">
        <FileStatusColumn file={file} />
        {file.status !== 'done' && (
          <IconRemove type="XCompact" onClick={() => onRemove(file)} />
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
        <Icon
          type="Checkmark"
          style={{ color: '#31C25A', marginLeft: '17.45px' }}
        />
      </>
    );
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
