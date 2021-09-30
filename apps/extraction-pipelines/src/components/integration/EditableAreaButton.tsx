import styled from 'styled-components';
import { EditButton } from 'styles/StyledButton';

export const EditableAreaButton = styled(EditButton)`
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
