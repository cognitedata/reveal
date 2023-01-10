import React from 'react';
import { Document } from '@data-exploration-components/domain/documents';
import styled from 'styled-components';
import Highlighter from 'react-highlight-words';
import {
  HighlightCell,
  EllipsisText,
  FileThumbnail,
} from '@data-exploration-components/components';
import { Popover } from 'antd';
import {
  isFilePreviewable,
  fileIconMapper,
} from '@data-exploration-components/utils';
import { DocumentIcon, Flex } from '@cognite/cogs.js';

const DocumentIconWrapper = styled.div`
  height: 32px;
  width: 32px;
`;
export const DocumentNamePreview = ({
  fileName,
  file,
  query,
}: {
  fileName: string;
  file: Document;
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
        <Flex gap={4} alignItems="center">
          <DocumentIconWrapper>
            {file?.mimeType && (
              <DocumentIcon
                file={fileIconMapper[file.mimeType] || 'file.txt'}
              />
            )}
          </DocumentIconWrapper>

          <EllipsisText level={2} strong lines={2}>
            <Highlighter
              searchWords={(query || '').split(' ')}
              textToHighlight={fileName || ''}
              autoEscape
            />
          </EllipsisText>
        </Flex>
      </Popover>
    );
  }

  return (
    <Flex gap={4} alignItems="center">
      <DocumentIconWrapper>
        {file?.mimeType && (
          <DocumentIcon file={fileIconMapper[file.mimeType]} />
        )}
      </DocumentIconWrapper>
      <EllipsisText level={2} strong lines={2}>
        <HighlightCell text={fileName} query={query} />
      </EllipsisText>
    </Flex>
  );
};
