import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';
import Highlighter from 'react-highlight-words';

export const HighlightCell = ({
  text,
  query,
  lines = 2,
}: {
  text?: string;
  query?: string;
  lines?: number;
}) => {
  return (
    <EllipsisText level={2} strong lines={lines}>
      <Tooltip content={text} placement="top-start" arrow={false} interactive>
        <Highlighter
          searchWords={(query || '').split(' ')}
          textToHighlight={text || ''}
          autoEscape
        />
      </Tooltip>
    </EllipsisText>
  );
};

export const EllipsisText = styled(Body)(
  ({ lines = 1 }: { lines?: number }) => css`
    display: block; /* Fallback for non-webkit */
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
  `
);
