import { Button } from '@cognite/cogs.js-v9';
import styled from 'styled-components';

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
  margin-bottom: 8px;

  p {
    width: 100%;
    text-align: left;
    font-weight: 600;
    font-family: 'Inter';
    text-align: left;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }
`;
