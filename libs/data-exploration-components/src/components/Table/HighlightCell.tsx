import React, { useRef } from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';
import Highlighter from 'react-highlight-words';
import { useIsOverflow } from 'hooks';

export const HighlightCell = React.memo(
  ({
    text,
    query,
    lines = 2,
    className,
  }: {
    text?: string;
    query?: string;
    lines?: number;
    className?: string;
  }) => {
    const textWrapperRef = useRef<HTMLDivElement>(null);
    const isEllipsisActive = useIsOverflow(textWrapperRef);

    return (
      <EllipsisText level={2} lines={lines} className={className}>
        <div ref={textWrapperRef}>
          <Tooltip
            content={text}
            placement="top-start"
            arrow={false}
            interactive
            disabled={!isEllipsisActive}
          >
            <Highlighter
              searchWords={(query || '').split(' ')}
              textToHighlight={text || ''}
              autoEscape
            />
          </Tooltip>
        </div>
      </EllipsisText>
    );
  }
);

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
