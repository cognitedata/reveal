import React, { useRef } from 'react';
import Highlighter from 'react-highlight-words';

import { Tooltip } from '@cognite/cogs.js';

import { useIsOverflow } from '@data-exploration-lib/core';

import { EllipsisText } from '../elements';

export const HighlightCell = React.memo(
  ({
    text,
    query,
    lines = 2,
    className,
    highlightPrefix,
  }: {
    text?: string;
    query?: string;
    lines?: number;
    className?: string;
    // Highlight if query is prefix to the text.
    highlightPrefix?: boolean;
  }) => {
    const textWrapperRef = useRef<HTMLDivElement>(null);
    const isEllipsisActive = useIsOverflow(textWrapperRef);

    const getSearchWords = () => {
      if (
        highlightPrefix &&
        text &&
        query &&
        !text.toLowerCase().startsWith(query.toLowerCase())
      ) {
        // Do not return any search words if highlightPrefix is true and query is not prefix to the text.
        return [];
      }

      return (query || '').split(' ');
    };

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
              searchWords={getSearchWords()}
              textToHighlight={text || ''}
              autoEscape
            />
          </Tooltip>
        </div>
      </EllipsisText>
    );
  }
);
