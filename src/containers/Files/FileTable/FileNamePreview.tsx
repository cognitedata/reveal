import React from 'react';
import { FileInfo } from '@cognite/sdk';
import Highlighter from 'react-highlight-words';
import { HighlightCell, EllipsisText, FileThumbnail } from 'components';
import { Popover } from 'antd';
import { isFilePreviewable } from 'utils/FileUtils';

export const FileNamePreview = ({
  fileName,
  file,
  query,
}: {
  fileName: string;
  file: FileInfo;
  query: string | undefined;
}) => {
  const isPreviewable = isFilePreviewable(file);

  if (isPreviewable) {
    return (
      <Popover
        content={<FileThumbnail file={file} />}
        title={fileName}
        trigger="hover"
        placement="topLeft"
      >
        <EllipsisText level={2} strong lines={2}>
          <Highlighter
            searchWords={(query || '').split(' ')}
            textToHighlight={fileName || ''}
            autoEscape
          />
        </EllipsisText>
      </Popover>
    );
  }

  return <HighlightCell text={fileName} query={query} />;
};
