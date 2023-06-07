import React from 'react';

import styled from 'styled-components';

import { useIsOverflow } from '@data-exploration-components/hooks';

import { Tooltip } from '@cognite/cogs.js';

export const Ellipsis: React.FC<{ value: string }> = ({
  value,
}: {
  value: string;
}) => {
  const textWrapperRef = React.useRef<HTMLDivElement>(null);
  const isEllipsisActive = useIsOverflow(textWrapperRef);

  return (
    <TooltipWrapper ref={textWrapperRef}>
      <Tooltip
        content={value}
        key={value}
        interactive
        placement="top-start"
        arrow={false}
        disabled={!isEllipsisActive}
      >
        <>{value}</>
      </Tooltip>
    </TooltipWrapper>
  );
};

export const TooltipWrapper = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
