import React from 'react';

import { StyledTooltip } from '../styled';

type Props = { prefix?: string; date: Date };
export default function CreatedTime({ prefix, date }: Props) {
  return (
    <StyledTooltip content={date.toUTCString()}>
      <>
        {prefix && <span style={{ marginRight: 5 }}>{prefix}</span>}
        {new Intl.DateTimeFormat(undefined, {
          day: '2-digit',
          month: 'short',
          year: '2-digit',
        }).format(date)}
      </>
    </StyledTooltip>
  );
}
