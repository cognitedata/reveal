import { Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const PanelContent = styled.div`
  padding: 16px;
  max-height: calc(100% - 138px);
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .cogs-detail {
    display: flex;
    color: var(--cogs-text-secondary);
    margin: 8px 0 8px 0;
    text-align: left;
  }
`;

export const StyledButton = styled(Button)`
  width: 100%;
  align-items: center;
  justify-content: left;
  font-weight: 600;
  font-family: Inter;
  margin-bottom: 8px;

  p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }
`;
