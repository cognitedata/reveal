import React, { useCallback } from 'react';

import styled from 'styled-components';

import { HighlightCell, EllipsisText } from '@data-exploration/components';
import {
  DASH,
  isFilePreviewable,
  mapMimeTypeToDocumentType,
} from '@data-exploration-lib/core';
import { InternalDocument } from '@data-exploration-lib/domain-layer';
import { Popover } from 'antd';

import { DocumentIcon, Flex } from '@cognite/cogs.js';

import { FileThumbnail } from '../FileThumbnail';

const DocumentIconWrapper = styled.div`
  height: 17px;
  width: 17px;
  display: flex;
  align-items: center;
`;
export const DocumentNamePreview = ({
  fileName,
  file,
  query,
}: {
  fileName: string;
  file: InternalDocument;
  query: string | undefined;
}) => {
  const isPreviewable = isFilePreviewable(file);
  const name = fileName || '';

  const getDocumentIcon = useCallback(() => {
    return (
      <DocumentIconWrapper>
        {file?.mimeType && (
          <DocumentIcon file={mapMimeTypeToDocumentType(file.mimeType)} />
        )}
      </DocumentIconWrapper>
    );
  }, [file.mimeType]);

  if (isPreviewable) {
    return (
      <Flex gap={4} alignItems="center">
        <Popover
          content={<FileThumbnail file={file} />}
          title={name}
          trigger="hover"
          placement="topLeft"
        >
          {getDocumentIcon()}
        </Popover>

        <HighlightCell query={query} text={fileName || DASH} lines={1} />
      </Flex>
    );
  }

  return (
    <Flex gap={4} alignItems="center">
      {getDocumentIcon()}
      <EllipsisText level={2} lines={2}>
        <HighlightCell text={name} query={query} />
      </EllipsisText>
    </Flex>
  );
};
