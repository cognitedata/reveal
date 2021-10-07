import styled from 'styled-components';
import React, { PropsWithChildren } from 'react';
import { EditButton } from 'styles/StyledButton';

export const EditableAreaButton = styled((props: PropsWithChildren<any>) => {
  const { children, disabled } = props;
  return disabled ? (
    <div css="padding: 1em">{children}</div>
  ) : (
    <EditButton {...props}>{children}</EditButton>
  );
})`
  &.cogs-btn {
    .cogs-icon {
      &.cogs-icon-Edit {
        align-self: flex-start;
      }
    }
  }
  &.cogs-btn.cogs-btn-ghost.has-content {
    display: flex;
  }
  .cogs-documentation--header {
    margin: 1rem 0;
    text-align: left;
  }
`;
