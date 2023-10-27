import React, { useRef } from 'react';

import { useIsOverflow } from '@fdx/shared/hooks/useIsOverflow';

import { Tooltip } from '@cognite/cogs.js';

import { EllipsisText } from '../elements';

export const TooltipCell = React.memo(
  ({
    text,
    lines = 2,
    className,
  }: {
    text?: string;
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
            <span>{text}</span>
          </Tooltip>
        </div>
      </EllipsisText>
    );
  }
);
